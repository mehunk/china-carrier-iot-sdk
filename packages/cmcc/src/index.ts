import * as _ from 'lodash';
import { AxiosInstance, default as axios } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';

import { QueryObj } from './types';
import config from './config';
import * as apis from './mixins';
import { createHttpLogObjFromError, createHttpLogObjFromResponse } from './utils/log';
import {
  Options,
  AccessTokenObj,
  GetStatusResponse,
  GetUsageResponse,
  MobileNoType,
  OperationType,
  SetStatusResponse,
  Status
} from './types';

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

export class CmccIotClient {
  [key: string]: any;

  private readonly httpClient: AxiosInstance;
  private readonly appId: string;
  private readonly password: string;
  private readonly rootEndpoint: string;
  private store: AccessToken;
  private maxRetryTimes = 3;
  private maxTimeoutMs = 60 * 1000;

  public getStatus: (type: MobileNoType, id: string) => Promise<GetStatusResponse>;
  public setStatus: (type: MobileNoType, id: string, operationType: OperationType) => Promise<SetStatusResponse>;
  public getUsage: (type: MobileNoType, id: string) => Promise<GetUsageResponse>;

  /**
   * 构造函数
   *
   * @param options - 针对当前接口的构造参数
   * @param customOptions - 允许自定义的保存 toke，获取 token 和记录日志的方法对象
   */
  constructor(options: Options, customOptions: CustomOptions = {}) {
    this.appId = options.appId;
    this.password = options.password;
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

  /**
   * 接口请求
   *
   * @param path - 路径
   * @param methodQueryObj - 方法查询参数
   * @param retryTimes
   * @returns 响应体
   */
  private async request(path: string, methodQueryObj: QueryObj, retryTimes = this.maxRetryTimes): Promise<object> {
    let res;
    const accessToken = await this.ensureAccessToken();
    const systemQueryObj: QueryObj = {
      transid: this.getTransId(),
      token: accessToken.token
    };
    const queryObj = Object.assign({}, methodQueryObj, systemQueryObj);
    const traceId = uuidv4();
    const requestTime = new Date();
    try {
      res = await this.httpClient.get(path, {
        params: queryObj
      });
    } catch (e) {
      const httpObj = createHttpLogObjFromError(traceId, requestTime, e);
      let errMessage: string;
      if (e.response) {
        // 如果是响应异常
        httpObj.response = _.pick(e.response, ['status', 'headers', 'data']);
        errMessage = `接口响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${traceId}！`;
      } else {
        // 如果是请求异常
        errMessage = `接口请求失败！异常描述：${e.message}，traceId：${traceId}！`;
      }
      this.log(httpObj);
      // 抛出新的异常
      throw new Error(errMessage);
    }

    // 打印日志
    const httpObj = createHttpLogObjFromResponse(traceId, requestTime, res);
    this.log(httpObj);

    const resData = res.data;

    if (resData.status !== '0') {
      // 如果结果码是错误
      if (resData.status === '12021' && retryTimes > 0) {
        // 如果是 token 不存在或者失效，则重新再请求一次 token
        return this.getToken().then(() => this.request(path, methodQueryObj, retryTimes - 1));
      }
      throw new Error(
        `接口请求结果失败！异常描述：结果码 ${resData.status}，异常原因 ${resData.message}，traceId：${traceId}！`
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
    const accessToken = await this.getAccessToken();
    if (accessToken && accessToken.isValid()) {
      return accessToken;
    }
    return this.getToken();
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
    const path = '/get/token';
    const traceId = uuidv4();
    const requestTime = new Date();
    let res;
    try {
      res = await this.httpClient.get(path, {
        params: {
          appid: this.appId,
          password: this.password,
          transid: this.getTransId()
        }
      });
    } catch (e) {
      const httpObj = createHttpLogObjFromError(traceId, requestTime, e);
      let errMessage: string;
      if (e.response) {
        httpObj.response = _.pick(e.response, ['status', 'headers', 'data']);
        errMessage = `获取 Token 响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${traceId}！`;
      } else {
        errMessage = `获取 Token 请求失败！异常描述：${e.message}，traceId：${traceId}！`;
      }
      this.log(httpObj);
      throw new Error(errMessage);
    }

    const httpObj = createHttpLogObjFromResponse(traceId, requestTime, res);
    this.log(httpObj);

    const resData = res.data;
    if (resData.status !== '0') {
      throw new Error(`获取 Token 失败！结果码 ${resData.status}，异常原因 ${resData.message}，traceId：${traceId}！`);
    }

    let token: string;
    try {
      token = resData.result[0].token;
    } catch (e) {
      throw new Error(`获取 Token 失败！异常描述：接口返回格式不正确，traceId：${traceId}！`);
    }

    const expireTime = Date.now() + (60 - 10) * 60 * 1000;
    const accessToken = new AccessToken(token, expireTime);
    await this.setAccessToken(accessToken);
    return accessToken;
  }
}

CmccIotClient.mixin(apis);

export { Options, MobileNoType, OperationType, Status };
