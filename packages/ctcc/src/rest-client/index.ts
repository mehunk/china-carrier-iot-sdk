import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import * as apis from './mixins';
import {
  Options,
  AccessTokenObj,
  MobileNoType,
  GetUsageType,
  GetUsageResponse,
  AxiosRequestConfigExtend,
  AxiosResponseExtend
} from './types';
import config from './config';
import { createHttpLogObjFromError, createHttpLogObjFromResponse, RequestError } from './utils';

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
        this.log(httpObj);
        throw e;
      }

      // 打印网络请求日志
      const httpObj = createHttpLogObjFromResponse(res);
      this.log(httpObj);

      return res;
    };

    return descriptor;
  };
}

export class RestClient {
  [key: string]: any;

  private readonly httpClient: AxiosInstance;
  private readonly username: string;
  private readonly password: string;
  private readonly rootEndpoint: string;
  private store: AccessToken;
  private maxRetryTimes = 3;
  private maxTimeoutMs = 60 * 1000;

  public getUsage: (
    mobileNoType: MobileNoType,
    id: string,
    month: string,
    fromDate: string,
    toDate: string,
    type: GetUsageType[]
  ) => Promise<GetUsageResponse>;

  constructor(options: Options, customOptions: CustomOptions = {}) {
    this.username = options.username;
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

  @log()
  private _httpRequest(config: AxiosRequestConfig): Promise<AxiosResponseExtend> {
    return this.httpClient.request({
      method: 'POST',
      ...config
    });
  }

  /**
   * 从服务器获取 token
   *
   * @returns accessToken
   */
  private async getToken(): Promise<AccessToken> {
    const config = {
      url: '/login',
      data: {
        username: this.username,
        password: this.password
      }
    };
    let res: AxiosResponseExtend;
    try {
      res = await this._httpRequest(config);
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        errMessage = `获取 Token 响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${e.config.traceId}！`;
        if (typeof e.response.data === 'object') {
          errMessage += `错误码：${e.response.data.status}，错误信息：${e.response.data.msg}！`;
        }
      } else {
        errMessage = `获取 Token 请求失败！异常描述：${e.message}，traceId：${e.config.traceId}！`;
      }
      throw new RequestError(errMessage, e.config.traceId);
    }

    const resData = res.data;

    if (resData.status !== 200) {
      throw new RequestError(
        `获取 Token 失败！结果码 ${resData.status}，异常原因 ${resData.msg}，traceId：${res.config.traceId}！`,
        res.config.traceId
      );
    }

    const { token, expirationTime } = resData.data;
    // 失效时间较接口返回的失效时间提前 10 分钟
    const expireTime = Date.now() + Math.round((expirationTime / 6) * 5);
    const accessToken = new AccessToken(token, expireTime);
    await this.setAccessToken(accessToken);
    return accessToken;
  }

  private async request(config: AxiosRequestConfig & { retryTimes: number }): Promise<object> {
    const accessToken = await this.ensureAccessToken();
    config.headers = {
      'X-Access-Token': accessToken.token
    };
    let res: AxiosResponseExtend;
    try {
      res = await this._httpRequest(config);
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        if (
          e.response.status === 401 && // 如果是因为 token 失效
          (typeof config.retryTimes === 'undefined' || config.retryTimes > 0) // 并且没有超过最大重试次数
        ) {
          config.retryTimes = typeof config.retryTimes === 'undefined' ? this.maxRetryTimes - 1 : config.retryTimes - 1;
          return this.getToken().then(() => this.request(config));
        }
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
    if (resData.status !== 200) {
      throw new RequestError(
        `接口请求结果失败！异常描述：结果码 ${resData.status}，异常原因 ${resData.msg}，traceId：${res.config.traceId}！`,
        res.config.traceId
      );
    }

    return resData.data;
  }

  /**
   * 动态绑定成员函数
   * @param obj - 属性为函数的对象
   */
  public static mixin(obj: { [key: string]: Function }): void {
    Object.keys(obj).forEach(key => {
      if (RestClient.prototype.hasOwnProperty(key)) {
        throw new Error('不允许覆盖已经存在的成员方法 <' + key + '>');
      }
      RestClient.prototype[key] = obj[key];
    });
  }
}

RestClient.mixin(apis);

export * from './types';
