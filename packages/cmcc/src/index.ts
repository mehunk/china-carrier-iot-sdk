import * as EventEmitter from 'events';

import * as _ from 'lodash';
import { AxiosInstance, default as axios } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import { Redis } from 'ioredis';

import { QueryObj } from './types';
import config from './config';
import * as apis from './mixins';
import { createHttpLogObjFromError, createHttpLogObjFromResponse, RequestError } from './utils';
import {
  Options,
  AccessTokenObj,
  GetStatusResponse,
  GetUsageResponse,
  MobileNoType,
  OperationType,
  DeviceBindStatusCheckType,
  SetGroupMemberOperationType,
  SetGroupMemberEffectType,
  SetStatusResponse,
  GetDeviceBindStatusResponse,
  GetDetailResponse,
  GetStatusChangeHistoryResponse,
  GetCurrentPositionCityCodeResponse,
  GetCurrentPositionWgs84Response,
  GetLastPositionWgs84Response,
  GetLastPositionCityCodeResponse,
  Status,
  AxiosRequestConfigExtend,
  AxiosResponseExtend
} from './types';
import { sleep } from 'sleep-ts';

class AccessToken implements AccessTokenObj {
  constructor(
    public token: string = token /* eslint-disable-line @typescript-eslint/no-use-before-define */,
    public expireTime: number = expireTime /* eslint-disable-line @typescript-eslint/no-use-before-define */
  ) {}

  isValid(): boolean {
    return !!this.token && Date.now() < this.expireTime;
  }
}

export interface CustomOptions {
  maxRetryTimes?: number; // 最大重试次数
  maxTimeoutMs?: number; // 最大超时时间，单位毫秒
  getAccessToken?: () => Promise<AccessToken>;
  setAccessToken?: (token: AccessToken) => Promise<void>;
  log?: (obj: object) => Promise<void>;
}

function log() {
  return function(target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const method = descriptor.value;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    descriptor.value = async function(...args: any[]): Promise<AxiosResponseExtend> {
      let res: AxiosResponseExtend;
      try {
        res = await method.apply(this, args);
      } catch (e) {
        // 打印网络请求错误日志
        const httpObj = createHttpLogObjFromError(e);
        if (e.response) {
          httpObj.response = _.pick(e.response, ['status', 'headers', 'data']);
        }
        setImmediate(async () => {
          await this.log(httpObj);
        });
        throw e;
      }

      // 打印网络请求日志
      const httpObj = createHttpLogObjFromResponse(res);
      setImmediate(async () => {
        await this.log(httpObj);
      });

      return res;
    };

    return descriptor;
  };
}

export class CmccIotClient extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  private readonly httpClient: AxiosInstance;
  private readonly redis: Redis;
  private readonly appId: string;
  private readonly password: string;
  private readonly rootEndpoint: string;
  private store: AccessToken;
  private maxRetryTimes = 3;
  private maxTimeoutMs = 60 * 1000;
  private readonly lockKey: string;

  public getStatus: (type: MobileNoType, id: string) => Promise<GetStatusResponse>;
  public setStatus: (type: MobileNoType, id: string, operationType: OperationType) => Promise<SetStatusResponse>;
  public getUsage: (type: MobileNoType, id: string) => Promise<GetUsageResponse>;
  public getDeviceBindStatus: (msisdn: string, checkType: DeviceBindStatusCheckType) => Promise<GetDeviceBindStatusResponse>;
  public getDetail: (type: MobileNoType, id: string) => Promise<GetDetailResponse>;
  public getStatusChangeHistory: (type: MobileNoType, id: string) => Promise<GetStatusChangeHistoryResponse>;
  public getCurrentPositionCityCode: (type: MobileNoType, id: string) => Promise<GetCurrentPositionCityCodeResponse>;
  public getCurrentPositionWgs84: (type: MobileNoType, id: string) => Promise<GetCurrentPositionWgs84Response>;
  public getLastPositionCityCode: (type: MobileNoType, id: string) => Promise<GetLastPositionCityCodeResponse>;
  public getLastPositionWgs84: (type: MobileNoType, id: string) => Promise<GetLastPositionWgs84Response>;
  public setGroupMember: (
    msisdn: string,
    groupId: string,
    operationType: SetGroupMemberOperationType,
    effectType?: SetGroupMemberEffectType
  ) => Promise<void>;

  /**
   * 构造函数
   *
   * @param options - 针对当前接口的构造参数
   * @param customOptions - 允许自定义的保存 toke，获取 token 和记录日志的方法对象
   */
  constructor(options: Options, customOptions: CustomOptions = {}) {
    super();
    this.redis = options.redis;
    this.appId = options.appId;
    this.password = options.password;
    this.lockKey = options.lockKey;
    this.rootEndpoint = options.rootEndpoint || config.rootEndpoint;

    const customOptionsKeys = ['maxRetryTimes', 'maxTimeoutMs', 'getAccessToken', 'setAccessToken', 'log'];

    for (const [key, value] of Object.entries(_.pick(customOptions, customOptionsKeys))) {
      if (key === 'getAccessToken') {
        this.getAccessToken = async function(): Promise<AccessToken> {
          const accessTokenObj = await customOptions.getAccessToken();
          return accessTokenObj ? new AccessToken(accessTokenObj.token, accessTokenObj.expireTime) : null;
        };
      } else {
        this[key] = value;
      }
    }

    this.httpClient = axios.create({
      baseURL: this.rootEndpoint,
      timeout: this.maxTimeoutMs
    });
    this.httpClient.interceptors.request.use(config => {
      (config as AxiosRequestConfigExtend).requestTime = new Date();
      (config as AxiosRequestConfigExtend).traceId = uuidv4();
      return config;
    });
  }

  private async getAccessToken(): Promise<AccessToken> {
    return this.store;
  }

  private async setAccessToken(accessToken: AccessToken): Promise<void> {
    this.store = accessToken;
  }

  private async log(obj: object): Promise<void> {
    console.dir(obj, { depth: null });
  }

  /**
   * 动态绑定成员函数
   * @param obj - 属性为函数的对象
   */
  public static mixin(obj: { [key: string]: Function }): void {
    Object.keys(obj).forEach(key => {
      if (CmccIotClient.prototype.hasOwnProperty(key)) {
        throw new Error('不允许覆盖已经存在的成员方法 <' + key + '>');
      }
      CmccIotClient.prototype[key] = obj[key];
    });
  }

  @log()
  private _httpRequest(path: string, queryObj: QueryObj): Promise<AxiosResponseExtend> {
    return this.httpClient.get(path, {
      params: queryObj
    });
  }

  /**
   * 接口请求
   *
   * @param path - 路径
   * @param methodQueryObj - 方法查询参数
   * @param retryTimes
   * @returns 响应体
   */
  private async request(path: string, methodQueryObj: QueryObj, retryTimes = this.maxRetryTimes): Promise<object> {
    let res: AxiosResponseExtend;
    const accessToken = await this.ensureAccessToken();
    const systemQueryObj: QueryObj = {
      transid: this.getTransId(),
      token: accessToken.token
    };
    const queryObj = Object.assign({}, methodQueryObj, systemQueryObj);
    try {
      res = await this._httpRequest(path, queryObj);
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        // 如果是响应异常
        errMessage = `接口响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${e.config.traceId}！`;
      } else {
        // 如果是请求异常
        errMessage = `接口请求失败！异常描述：${e.message}，traceId：${e.config.traceId}！`;
      }
      // 抛出新的异常
      throw new RequestError(errMessage, e.config.traceId);
    }

    const resData = res.data;

    if (resData.status !== '0') {
      // 如果结果码是错误
      if (resData.status === '12021' && retryTimes > 0) {
        // 如果是 token 不存在或者失效，则重新再请求一次 token
        return this.getToken().then(() => this.request(path, methodQueryObj, retryTimes - 1));
      }
      throw new RequestError(
        `接口请求结果失败！异常描述：结果码 ${resData.status}，异常原因 ${resData.message}，traceId：${res.config.traceId}！`,
        res.config.traceId
      );
    }

    return resData.result;
  }

  /**
   * 从缓存中或直接从服务器获取有效的 token
   *
   * @returns accessToken
   */
  private async ensureAccessToken(): Promise<AccessToken> {
    let leftRetryTimes = 5;
    let accessToken: AccessToken;

    do {
      accessToken = await this.getAccessToken();
      if (accessToken && accessToken.isValid()) {
        return accessToken;
      }

      const isLockGotten = await this.getLock();
      if (isLockGotten) {
        try {
          accessToken = await this.getToken();
          await this.unlock();
          return accessToken;
        } catch (e) {
          await this.unlock();
          throw e;
        }
      }

      await sleep(500);
    } while (leftRetryTimes-- > 0)

    throw Error('获取 token 失败！等待时间超时！');
  }

  /**
   * 获取 transId
   *
   * @returns transId
   */
  private getTransId(): string {
    return this.appId + moment().format('YYYYMMDDHHmmssSSSSSSSS');
  }

  /**
   * 从服务器获取 token
   *
   * @returns accessToken
   */
  private async getToken(): Promise<AccessToken> {
    let res: AxiosResponseExtend;
    try {
      res = await this._httpRequest('/get/token', {
        appid: this.appId,
        password: this.password,
        transid: this.getTransId()
      });
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        errMessage = `获取 Token 响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${e.config.traceId}！`;
      } else {
        errMessage = `获取 Token 请求失败！异常描述：${e.message}，traceId：${e.config.traceId}！`;
      }
      throw new RequestError(errMessage, e.config.traceId);
    }

    const resData = res.data;
    if (resData.status !== '0') {
      throw new RequestError(
        `获取 Token 失败！结果码 ${resData.status}，异常原因 ${resData.message}，traceId：${res.config.traceId}！`,
        res.config.traceId
      );
    }

    let token: string;
    try {
      token = resData.result[0].token;
    } catch (e) {
      throw new RequestError(
        `获取 Token 失败！异常描述：接口返回格式不正确，traceId：${res.config.traceId}！`,
        res.config.traceId
      );
    }

    const expireTime = Date.now() + (60 - 10) * 60 * 1000;
    const accessToken = new AccessToken(token, expireTime);
    await this.setAccessToken(accessToken);
    return accessToken;
  }

  private async getLock(): Promise<boolean> {
    const ttl = 3; // 生存时间暂时设置为 3 秒
    const res = await this.redis.set(this.lockKey, 1, 'ex', ttl, 'nx');
    return res === 'OK';
  }

  private async unlock(): Promise<number> {
    return this.redis.del(this.lockKey);
  }
}

CmccIotClient.mixin(apis);

export {
  Options,
  MobileNoType,
  OperationType,
  SetGroupMemberOperationType,
  SetGroupMemberEffectType,
  DeviceBindStatusCheckType,
  Status
};
