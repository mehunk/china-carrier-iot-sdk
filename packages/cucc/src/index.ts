import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { sleep } from 'sleep-ts';

import config from './config';
import * as apis from './mixins';
import { createHttpLogObjFromError, createHttpLogObjFromResponse } from './utils/log';
import {
  Options,
  CustomOptions,
  GetDetailResponse,
  GetUsageResponse,
  SetDetailResponse,
  SetDetailParams,
  Status,
  AxiosRequestConfigExtend,
  AxiosResponseExtend
} from './types';

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

export class CuccIotClient {
  [key: string]: any;

  private readonly authStr: string;
  private username: string;
  private key: string;
  private rootEndpoint: string;
  private maxRetryTimes = 3;
  private maxTimeoutMs = 60 * 1000;
  private httpClient: AxiosInstance;

  public getDetail: (iccid: string) => Promise<GetDetailResponse>;
  public setDetail: (iccid: string, detailParams: SetDetailParams) => Promise<SetDetailResponse>;
  public getUsage: (iccid: string) => Promise<GetUsageResponse>;

  constructor(options: Options, customOptions?: CustomOptions) {
    this.username = options.username;
    this.key = options.key;
    this.rootEndpoint = options.rootEndpoint || config.rootEndpoint;
    this.authStr = ['Basic', Buffer.from(this.username + ':' + this.key).toString('base64')].join(' ');

    const customOptionsKeys = ['maxRetryTimes', 'maxTimeoutMs', 'log'];

    for (const [key, value] of Object.entries(_.pick(customOptions, customOptionsKeys))) {
      this[key] = value;
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
    return this.httpClient.request({
      headers: {
        Authorization: this.authStr
      },
      ...config
    });
  }

  private async request(config: AxiosRequestConfig & { retryTimes?: number }): Promise<any> {
    let res: AxiosResponseExtend;
    try {
      res = await this._httpRequest(config);
      return res.data;
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        if (
          e.response.status === 429 && // 如果是超过单位时间请求次数限制
          (typeof config.retryTimes === 'undefined' || config.retryTimes > 0) // 并且重试次数不存在或者大于 0
        ) {
          // 休眠一段时间以后再请求
          const sleepMs = 1000;
          config.retryTimes = typeof config.retryTimes === 'undefined' ? this.maxRetryTimes - 1 : config.retryTimes - 1;
          return sleep(sleepMs).then(() => this.request(config));
        }

        errMessage = `接口响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${e.config.traceId}！`;
        if (typeof e.response.data === 'object') {
          errMessage += `错误码：${e.response.data.errorCode}，错误信息：${e.response.data.errorMessage}！`;
        }
      } else {
        errMessage = `接口请求失败！异常描述：${e.message}，traceId：${e.config.traceId}！`;
      }
      throw new Error(errMessage);
    }
  }

  /**
   * 动态绑定成员函数
   * @param obj - 属性为函数的对象
   */
  public static mixin(obj: { [key: string]: Function }): void {
    Object.keys(obj).forEach(key => {
      if (CuccIotClient.prototype.hasOwnProperty(key)) {
        throw new Error('不允许覆盖已经存在的成员方法 <' + key + '>');
      }
      CuccIotClient.prototype[key] = obj[key];
    });
  }
}

CuccIotClient.mixin(apis);

export { Options, Status, CustomOptions };
