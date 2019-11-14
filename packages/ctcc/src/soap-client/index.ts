import * as soap from 'soap';

import * as apis from './mixins';
import { MobileNoType, GetDetailResponse, OperationType, SetStatusResponse } from './types';

export class SoapClient {
  [key: string]: any;

  private readonly rootEndpoints: Set<string>;
  private clientMap: Map<string, soap.Client> = new Map();

  public getDetail: (type: MobileNoType, id: string) => Promise<GetDetailResponse>;
  public setStatus: (type: MobileNoType, id: string, operationType: OperationType) => Promise<SetStatusResponse>;

  constructor(private username: string, private password: string, rootEndpoints: string[]) {
    this.rootEndpoints = new Set(rootEndpoints);
  }

  /**
   * 初始化所有 soap 客户端
   */
  public async init(): Promise<void> {
    await this.createClientMap();
  }

  /**
   * 创建所有 soap 客户端的 map
   */
  private async createClientMap(): Promise<void> {
    try {
      const rootEndpoints = Array.from(this.rootEndpoints);
      const asyncTasks = rootEndpoints.map(rootEndpoint => this.createClient(rootEndpoint));

      const clients = await Promise.all(asyncTasks);
      for (let i = 0; i < rootEndpoints.length; i++) {
        this.clientMap.set(rootEndpoints[i], clients[i]);
      }
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * 创建 soap 客户端
   *
   * @param rootEndpoint
   */
  private async createClient(rootEndpoint: string): Promise<soap.Client> {
    const client = await soap.createClientAsync(rootEndpoint);
    const wsSecurity = new soap.WSSecurity(this.username, this.password, {
      hasTimeStamp: false
    });
    client.setSecurity(wsSecurity);
    return client;
  }

  /**
   * 获取指定 url 的客户端
   *
   * @param rootEndpoint
   */
  private getClient(rootEndpoint?: string): soap.Client {
    // 如果没有指定 url，将首个 url 对应的客户端作为默认返回
    if (!rootEndpoint && this.rootEndpoints.size) {
      rootEndpoint = this.rootEndpoints.values().next().value;
    }
    return this.clientMap.get(rootEndpoint);
  }

  /**
   * 动态绑定成员函数
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
