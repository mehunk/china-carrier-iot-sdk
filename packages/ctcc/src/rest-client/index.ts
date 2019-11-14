import * as request from 'superagent';

import * as apis from './mixins';
import { AccessTokenObj, MobileNoType, GetUsageType, GetUsageResponse } from './types';

class AccessToken implements AccessTokenObj {
  constructor(
    public token: string = token /* eslint-disable-line @typescript-eslint/no-use-before-define */,
    public expireTime: number = expireTime /* eslint-disable-line @typescript-eslint/no-use-before-define */
  ) {}

  isValid(): boolean {
    return !!this.token && Date.now() < this.expireTime;
  }
}

export class RestClient {
  [key: string]: any;

  private store: AccessToken;
  private readonly getAccessToken: () => Promise<AccessToken>;
  private readonly saveAccessToken: (accessToken: AccessToken) => Promise<void>;
  public getUsage: (
    mobileNoType: MobileNoType,
    id: string,
    month: string,
    fromDate: string,
    toDate: string,
    type: GetUsageType[]
  ) => Promise<GetUsageResponse>;

  constructor(
    private username: string,
    private password: string,
    private rootEndpoint: string,
    getAccessToken?: () => Promise<AccessToken>,
    saveAccessToken?: (token: AccessToken) => Promise<void>
  ) {
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
   * 从服务器获取 token
   *
   * @returns accessToken
   */
  private async getToken(): Promise<AccessToken> {
    const url = this.rootEndpoint + '/login';
    let res;
    try {
      res = await request.post(url).send({
        username: this.username,
        password: this.password
      });
    } catch (e) {
      // 记录状态码、响应报文
      throw new Error(`获取 Token 发生异常！状态码：${e.status}，异常描述：${e.response.body.msg}。`);
    }

    const response = res.body;

    if (response.status !== 200) {
      throw new Error(`获取 Token 发生异常！异常描述：状态码 ${response.status}, 异常原因 "${response.msg}"。`);
    }

    const { token, expirationTime } = response.data;
    // 失效时间较接口返回的失效时间提前 10 分钟
    const expireTime = Date.now() + Math.round((expirationTime / 6) * 5);
    const accessToken = new AccessToken(token, expireTime);
    await this.saveAccessToken(accessToken);
    return accessToken;
  }

  private async request(path: string, body: any): Promise<object> {
    const accessToken = await this.ensureAccessToken();
    let res;
    try {
      res = await request
        .post(this.rootEndpoint + path)
        .set('X-Access-Token', accessToken.token)
        .send(body);
    } catch (e) {
      throw new Error(`接口请求异常！状态码：${e.status}，异常描述：${e.response.body.msg}。`);
    }

    const response = res.body;
    if (response.status !== 200) {
      throw new Error(`接口请求异常！异常描述：状态码 ${response.status}, 异常原因 "${response.msg}"。`);
    }

    return response.data;
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
