import * as request from 'superagent';
import * as moment from 'moment';

import { QueryObj } from './types';
import config from './config';
import * as apis from './mixins';
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

export class CmccIotClient {
  [key: string]: any;

  private readonly appId: string;
  private readonly password: string;
  private readonly rootEndpoint: string;
  private store: AccessToken;

  private readonly getAccessToken: () => Promise<AccessToken>;
  private readonly saveAccessToken: (accessToken: AccessToken) => Promise<void>;

  public getStatus: (type: MobileNoType, id: string) => Promise<GetStatusResponse>;
  public setStatus: (type: MobileNoType, id: string, operationType: OperationType) => Promise<SetStatusResponse>;
  public getUsage: (type: MobileNoType, id: string) => Promise<GetUsageResponse>;

  /**
   * 构造函数
   *
   * @param options - 针对当前接口的构造参数
   * @param getAccessToken - 获取 token 的自定义方法
   * @param saveAccessToken - 保存 token 的自定义方法
   */
  constructor(
    options: Options,
    getAccessToken?: () => Promise<AccessToken>,
    saveAccessToken?: (token: AccessToken) => Promise<void>
  ) {
    this.appId = options.appId;
    this.password = options.password;
    this.rootEndpoint = options.rootEndpoint || config.rootEndpoint;

    this.getAccessToken = getAccessToken
      ? async function(): Promise<AccessToken> {
          const accessTokenObj = await getAccessToken();
          return new AccessToken(accessTokenObj.token, accessTokenObj.expireTime);
        }
      : this._getAccessToken;
    this.saveAccessToken = saveAccessToken || this._setAccessToken;
  }

  private async _getAccessToken(): Promise<AccessToken> {
    return this.store;
  }

  private async _setAccessToken(accessToken: AccessToken): Promise<void> {
    this.store = accessToken;
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
   * @param url - URL
   * @param methodQueryObj - 方法查询参数
   * @returns 响应体
   */
  private async request(url: string, methodQueryObj: QueryObj): Promise<object> {
    let res;
    const accessToken = await this.ensureAccessToken();
    const systemQueryObj: QueryObj = {
      transid: this.getTransId(),
      token: accessToken.token
    };
    const queryObj = Object.assign({}, methodQueryObj, systemQueryObj);
    try {
      res = await request.get(this.rootEndpoint + url).query(queryObj);
    } catch (e) {
      // 处理异常
      let str;
      if (e.status === 401) {
        str = '认证失败！用户名或 key 错误！';
      }
      // 抛出新的异常
      throw new Error(str);
    }

    const response = res.body;
    if (response.status !== '0') {
      throw new Error(`请求接口发生异常！异常描述：状态码 ${response.status}, 异常原因 ${response.message}`);
    }

    return response.result;
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
    const url = this.rootEndpoint + '/get/token';
    let res;
    try {
      res = await request.get(url).query({
        appid: this.appId,
        password: this.password,
        transid: this.getTransId()
      });
    } catch (e) {
      throw new Error(`获取 Token 发生异常！异常描述：${e.message}。`);
    }

    const response = res.body;
    if (response.status !== '0') {
      throw new Error(`获取 Token 发生异常！异常描述：状态码 ${response.status}, 异常原因 "${response.message}"。`);
    }
    if (!Array.isArray(response.result) || !response.result.length) {
      throw new Error('获取 Token 发生异常！异常描述：接口返回格式不正确！');
    }

    const { token } = response.result[0];
    const expireTime = Date.now() + (60 - 10) * 60 * 1000;
    const accessToken = new AccessToken(token, expireTime);
    await this.saveAccessToken(accessToken);
    return accessToken;
  }
}

CmccIotClient.mixin(apis);

export { Options, MobileNoType, OperationType, Status };
