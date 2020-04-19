import * as EventEmitter from 'events';

import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { parseStringPromise } from 'xml2js';
import { naturalOrdering, strEnc } from 'ctcc-cmp-des';

import config from './config';
import * as apis from './mixins';
import { createHttpLogObjFromError, createHttpLogObjFromResponse, RequestError } from './utils';
import {
  Options,
  CustomOptions,
  AxiosRequestConfigExtend,
  AxiosResponseExtend,
  GetUsageResponse,
  GetStatusResponse,
  SetStatusResponse,
  ActivateActivationReadyResponse,
  Status,
  OperationType
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

export class CtccCmpIotClient extends EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;

  private readonly userId: string;
  private readonly password: string;
  private readonly key: string[] = [];
  private readonly encryptedPassword: string;
  private readonly rootEndpoint: string;
  private httpClient: AxiosInstance;

  public getUsage: (msisdn: string) => Promise<GetUsageResponse>;
  public getRealNameStatus: (msisdn: string) => Promise<boolean>;
  public getStatus: (msisdn: string) => Promise<GetStatusResponse>;
  public setStatus: (msisdn: string, operationType: OperationType) => Promise<SetStatusResponse>;
  public activateActivationReady: (msisdn: string) => Promise<ActivateActivationReadyResponse>;

  constructor(options: Options, customOptions: CustomOptions) {
    super();
    this.userId = options.userId;
    this.password = options.password;
    this.rootEndpoint = options.rootEndpoint || config.rootEndpoint;
    for (let i = 0; i < 3; i++) {
      this.key.push(options.key.substring(i * 3, (i + 1) * 3));
    }
    this.encryptedPassword = this.encryptPassword();

    const customOptionsKeys = ['maxTimeoutMs', 'log'];

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
    this.httpClient.interceptors.response.use(async res => {
      try {
        res.data = await parseStringPromise(res.data, {
          explicitArray: false,
          explicitRoot: false,
          ignoreAttrs: true
        });
      } catch (e) {}
      return res;
    })
  }

  private encryptPassword(): string {
    return strEnc(this.password, this.key[0], this.key[1], this.key[2]);
  }

  private getSign(encryptArr: string[]): string {
    const orderedArr = naturalOrdering([
        ...encryptArr,
      this.userId,
      this.password
    ]);
    return strEnc(orderedArr, this.key[0], this.key[1], this.key[2]);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async request(config: AxiosRequestConfig & { retryTimes?: number }, encryptArr: string[]): Promise<any> {
    let res: AxiosResponseExtend;
    const { params } = config;
    // eslint-disable-next-line @typescript-eslint/camelcase
    params.user_id = this.userId;
    params.passWord = this.encryptedPassword;
    params.sign = this.getSign(encryptArr);
    try {
      res = await this._httpRequest(config);
    } catch (e) {
      let errMessage: string;
      if (e.response) {
        errMessage = `接口响应失败！异常描述：${e.message}，状态码：${e.response.status}，traceId：${e.config.traceId}！`;
        if (typeof e.response.data === 'object') {
          errMessage += `错误码：${e.response.data.errorCode}，错误信息：${e.response.data.errorMessage}！`;
        }
      } else {
        errMessage = `接口请求失败！异常描述：${e.message}，traceId：${e.config.traceId}！`;
      }
      throw new RequestError(errMessage, e.config.traceId);
    }

    if (typeof res.data === 'string') {
      const errMessage = `接口响应失败！异常描述：${res.data}，traceId：${res.config.traceId}！`;
      throw new RequestError(errMessage, res.config.traceId);
    }

    return res.data;
  }

  /**
   * 动态绑定成员函数
   * @param obj - 属性为函数的对象
   */
  public static mixin(obj: { [key: string]: Function }): void {
    Object.keys(obj).forEach(key => {
      if (CtccCmpIotClient.prototype.hasOwnProperty(key)) {
        throw new Error('不允许覆盖已经存在的成员方法 <' + key + '>');
      }
      CtccCmpIotClient.prototype[key] = obj[key];
    });
  }
}

CtccCmpIotClient.mixin(apis);

export { Options, CustomOptions, Status, OperationType };
