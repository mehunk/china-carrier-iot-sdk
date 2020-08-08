import * as crypto from 'crypto';
import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as moment from 'moment';
import axios, { AxiosInstance } from 'axios';
import { sleep } from 'sleep-ts';

import config from './config';
import * as apis from './mixins';
import { createHttpLogObjFromError, createHttpLogObjFromResponse, RequestError } from './utils';
import {
  Options,
  CustomOptions,
  MobileNoType,
  Response,
  GetDetailResponse,
  GetStatusResponse,
  GetUsageResponse,
  GetRealNameStatusResponse,
  HandelResponse,
  Status,
  AxiosRequestConfigExtend,
  AxiosResponseExtend
} from './types';

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

export class BewinnerClient {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  private readonly appId: string;
  private readonly secret: string;
  private readonly rootEndpoint: string;
  private maxRetryTimes = 3;
  private maxTimeoutMs = 60 * 1000;
  private httpClient: AxiosInstance;

  public getDetail: (mobileNoType: MobileNoType, mobileNo: string) => Promise<GetDetailResponse>;
  public getStatus: (mobileNoType: MobileNoType, mobileNo: string) => Promise<GetStatusResponse>;
  public getUsage: (mobileNoType: MobileNoType, mobileNo: string) => Promise<GetUsageResponse>;
  public getRealNameStatus: (mobileNoType: MobileNoType, mobileNo: string) => Promise<GetRealNameStatusResponse>;
  public activate: (mobileNoType: MobileNoType, mobileNo: string) => Promise<HandelResponse>;
  public deactivate: (mobileNoType: MobileNoType, mobileNo: string) => Promise<HandelResponse>;
  public reactivate: (mobileNoType: MobileNoType, mobileNo: string) => Promise<HandelResponse>;

  constructor(options: Options, customOptions?: CustomOptions) {
    this.appId = options.appId;
    this.secret = options.secret;
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
  private _httpRequest(path: string, body: object): Promise<AxiosResponseExtend> {
    const timestamps = moment().format('YYYYMMDDHHmmss');
    const sign = this.getSign(timestamps);

    return this.httpClient.post(path, body, {
      headers: {
        appId: this.appId,
        timeStamp: timestamps,
        sign
      }
    });
  }

  /**
   * 获取签名
   *
   * @param timestamps - 时间戳
   * @private
   */
  private getSign(timestamps: string): string {
    const str = this.appId + this.secret + timestamps;
    return crypto.createHash('md5')
      .update(str)
      .digest('hex');
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async request(path: string, requestBody: object, retryTimes?: number): Promise<any> {
    let res: AxiosResponseExtend;
    let responseBody: Response;
    try {
      res = await this._httpRequest(path, requestBody);
      responseBody = res.data;
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        errMessage = `接口响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${e.config.traceId}！`;
        if (typeof e.response.data === 'object') {
          errMessage += `异常响应结果：${JSON.stringify(e.response.data)}`;
        }
      } else {
        errMessage = `接口请求失败！异常描述：${e.message}，traceId：${e.config.traceId}！`;
      }
      throw new RequestError(errMessage, e.config.traceId);
    }

    const statusObj = responseBody.respStatus;

    if (
      statusObj.code === '1005' && // 如果是超过单位时间请求次数限制
      (typeof retryTimes === 'undefined' || retryTimes > 0) // 并且重试次数不存在或者大于 0)
    ) {
      // 休眠一段时间以后再请求
      const sleepMs = 1000;
      retryTimes = typeof retryTimes === 'undefined' ? this.maxRetryTimes - 1 : retryTimes - 1;
      return sleep(sleepMs).then(() => this.request(path, requestBody, retryTimes));
    }

    if (statusObj.code !== '0000') {
      const errMessage = `接口请求结果失败！结果码：${statusObj.code}，失败原因：${statusObj.msg}，traceId：${res.config.traceId}`;
      throw new Error(errMessage);
    }

    return responseBody.respBody;
  }

  /**
   * 动态绑定成员函数
   * @param obj - 属性为函数的对象
   */
  public static mixin(obj: { [key: string]: Function }): void {
    Object.keys(obj).forEach(key => {
      if (BewinnerClient.prototype.hasOwnProperty(key)) {
        throw new Error('不允许覆盖已经存在的成员方法 <' + key + '>');
      }
      BewinnerClient.prototype[key] = obj[key];
    });
  }
}

BewinnerClient.mixin(apis);

export {
  Options,
  MobileNoType,
  Status,
  CustomOptions,
  GetDetailResponse,
  GetStatusResponse,
  GetUsageResponse,
  GetRealNameStatusResponse,
  HandelResponse
};
