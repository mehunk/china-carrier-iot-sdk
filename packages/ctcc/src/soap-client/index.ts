import * as _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import * as soap from 'soap';

import * as apis from './mixins';
import { createHttpLogObjFromResponse, createHttpLogObjFromError } from './utils/log';
import config from './config';
import { Options, CustomOptions, MobileNoType, GetDetailResponse, OperationType, SetStatusResponse } from './types';

function logRequest() {
  return function(target: object, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const method = descriptor.value;
    descriptor.value = async function(
      client: soap.Client,
      path: string,
      methodName: string,
      args: object
    ): Promise<any[]> {
      let res;
      const httpLogObj = {
        requestTime: new Date(),
        request: {
          url: path,
          methodName,
          args
        }
      };
      try {
        res = await method.call(this, client, path, methodName, args);
      } catch (e) {
        // 打印网络请求错误日志
        this.log(createHttpLogObjFromError(httpLogObj, e));
        throw e;
      }

      // 打印网络请求日志
      this.log(createHttpLogObjFromResponse(httpLogObj, res));
      return res;
    };

    return descriptor;
  };
}

export class SoapClient {
  [key: string]: any;

  private readonly username: string;
  private readonly password: string;
  private readonly rootEndpoint: string;
  private clientMap: Map<string, soap.Client> = new Map();
  private readonly maxTimeoutMs = 60 * 1000;

  public getDetail: (type: MobileNoType, id: string) => Promise<GetDetailResponse>;
  public setStatus: (type: MobileNoType, id: string, operationType: OperationType) => Promise<SetStatusResponse>;

  constructor(options: Options, customOptions: CustomOptions = {}) {
    this.username = options.username;
    this.password = options.password;
    this.rootEndpoint = options.rootEndpoint || config.rootEndpoint;

    const customOptionsKeys = ['maxTimeoutMs', 'log'];
    for (const [key, value] of Object.entries(_.pick(customOptions, customOptionsKeys))) {
      this[key] = value;
    }
  }

  private async log(obj: object): Promise<void> {
    console.dir(obj, { depth: null });
  }

  @logRequest()
  private async _httpRequest(client: soap.Client, path: string, methodName: string, args: object): Promise<any[]> {
    const traceId = uuidv4();
    let res: any[];
    try {
      res = await client[methodName + 'Async'](args, {
        timeout: this.maxTimeoutMs
      });
    } catch (e) {
      Object.assign(e, { traceId });
      throw e;
    }

    res.push(traceId);
    return res;
  }

  private async request(path: string, methodName: string, args: object): Promise<object> {
    const client = await this.getClient(path);
    let res: any[];
    try {
      res = await this._httpRequest(client, path, methodName, args);
    } catch (e) {
      const errMessage = e.response
        ? `接口响应或结果异常！异常描述：${e.message}，traceId：${e.traceId}！`
        : `接口请求异常！异常描述：${e.message}，traceId：${e.traceId}！`;
      throw new Error(errMessage);
    }

    return {
      data: res[0],
      traceId: res[4]
    };
  }

  /**
   * 创建 soap 客户端
   *
   * @param path
   */
  private async createClient(path: string): Promise<soap.Client> {
    const url = this.rootEndpoint + path + '?WSDL';
    let client: soap.Client;
    try {
      client = await soap.createClientAsync(url);
    } catch (e) {
      throw new Error(`创建客户端异常！异常描述：${e.message}`);
    }

    const wsSecurity = new soap.WSSecurity(this.username, this.password, {
      hasTimeStamp: false
    });
    client.setSecurity(wsSecurity);

    // 将新创建的客户端保存到客户端 map 中
    this.clientMap.set(path, client);
    return client;
  }

  /**
   * 获取指定 url 的客户端
   *
   * @param path - 路径
   */
  private async getClient(path: string): Promise<soap.Client> {
    const client = this.clientMap.get(path);
    if (!client) {
      return this.createClient(path);
    }
    return client;
  }

  /**
   * 动态绑定成员函数
   *
   * @param obj - 属性为函数的对象
   */
  public static mixin(obj: { [key: string]: Function }): void {
    Object.keys(obj).forEach(key => {
      if (SoapClient.prototype.hasOwnProperty(key)) {
        throw new Error('不允许覆盖已经存在的成员方法 <' + key + '>');
      }
      SoapClient.prototype[key] = obj[key];
    });
  }
}

SoapClient.mixin(apis);

export * from './types';
