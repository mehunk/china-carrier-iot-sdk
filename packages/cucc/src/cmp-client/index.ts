import * as _ from 'lodash';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { sm3 } from 'sm-crypto';

import config from './config';
import * as apis from './mixins';
import {
  Options,
  CustomOptions,
  AxiosRequestConfigExtend,
  AxiosResponseExtend,
  GetRealNameStatusResponse
} from './types';
import { createHttpLogObjFromError, createHttpLogObjFromResponse, RequestError } from './utils';

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

export class CmpClient {
  [key: string]: any;

  private readonly appId: string;
  private readonly appSecret: string;
  private readonly rootEndpoint: string;
  private readonly maxTimeoutMs = 60 * 1000;
  private readonly httpClient: AxiosInstance;

  public getRealNameStatus: (iccid: string) => Promise<GetRealNameStatusResponse>;

  constructor(options: Options, customOptions?: CustomOptions) {
    this.appId = options.appId;
    this.appSecret = options.appSecret;
    this.rootEndpoint = options.rootEndpoint || config.rootEndpoint;

    const customOptionsKeys = ['maxTimeoutMs', 'log'];

    for (const [key, value] of Object.entries(_.pick(customOptions, customOptionsKeys))) {
      this[key] = value;
    }

    this.httpClient = axios.create({
      baseURL: this.rootEndpoint,
      timeout: this.maxTimeoutMs
    });
    this.httpClient.interceptors.request.use((config: AxiosRequestConfigExtend) => {
      config.requestTime = new Date();
      config.traceId = uuidv4();
      return config;
    });
  }

  /**
   * 默认打印日志方法，允许被自定义方法覆盖
   *
   * @param obj - 要打印的对象
   */
  private async log(obj: object): Promise<void> {
    console.dir(obj, { depth: null });
  }

  @log()
  private _httpRequest(config: AxiosRequestConfig): Promise<AxiosResponseExtend> {
    return this.httpClient.request(config);
  }

  getTransId(timestamp: string): string {
    return timestamp + Math.floor(100000 + Math.random() * 900000);
  }

  /**
   * 获取 token
   *
   * @param paramsObj
   */
  getToken(paramsObj: { [key: string]: any }): string {
    let str = '';
    Object.keys(paramsObj)
      .sort()
      .forEach(key => {
        str += key + paramsObj[key];
      });
    str += this.appSecret;
    return sm3(str);
  }

  private async request(config: AxiosRequestConfig & { retryTimes?: number }): Promise<any> {
    let res: AxiosResponseExtend;
    const timestamp = moment().format('YYYYMMDDHHmmssSSS');
    const paramsObj: { [key: string]: any } = {
      app_id: this.appId, // eslint-disable-line @typescript-eslint/camelcase
      timestamp,
      trans_id: this.getTransId(timestamp) // eslint-disable-line @typescript-eslint/camelcase
    };
    paramsObj.token = this.getToken(paramsObj);
    paramsObj.data = config.data;
    config.data = paramsObj;

    try {
      res = await this._httpRequest(config);
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        errMessage = `接口响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${e.config.traceId}！`;
        if (typeof e.response.data === 'object') {
          errMessage += `错误码：${e.response.data.status}，错误信息：${e.response.data.message}！`;
        }
      } else {
        errMessage = `接口请求失败！异常描述：${e.message}，traceId：${e.config.traceId}！`;
      }
      throw new RequestError(errMessage, e.config.traceId);
    }

    const body = res.data;
    if (body.status !== '0') {
      throw new RequestError(`接口请求失败！错误码：${body.status}，错误信息：${body.message}！`, res.config.traceId);
    }
    return body.data;
  }

  /**
   * 动态绑定成员函数
   * @param obj - 属性为函数的对象
   */
  public static mixin(obj: { [key: string]: Function }): void {
    Object.keys(obj).forEach(key => {
      if (CmpClient.prototype.hasOwnProperty(key)) {
        throw new Error('不允许覆盖已经存在的成员方法 <' + key + '>');
      }
      CmpClient.prototype[key] = obj[key];
    });
  }
}

CmpClient.mixin(apis);

export { CustomOptions, GetRealNameStatusResponse };
