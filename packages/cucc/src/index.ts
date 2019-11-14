import * as request from 'superagent';

import config from './config';
import * as apis from './mixins';
import { Options, GetDetailResponse, GetUsageResponse, SetDetailResponse, SetDetailParams, Status } from './types';

export class CuccIotClient {
  [key: string]: any;

  private readonly authStr: string;
  private username: string;
  private key: string;
  private rootEndpoint: string;

  public getDetail: (iccid: string) => Promise<GetDetailResponse>;
  public setDetail: (iccid: string, detailParams: SetDetailParams) => Promise<SetDetailResponse>;
  public getUsage: (iccid: string) => Promise<GetUsageResponse>;

  constructor(options: Options) {
    this.username = options.username;
    this.key = options.key;
    this.rootEndpoint = options.rootEndpoint || config.rootEndpoint;
    this.authStr = ['Basic', Buffer.from(this.username + ':' + this.key).toString('base64')].join(' ');
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

  private async get(path: string): Promise<object> {
    let res;
    try {
      res = await request.get(this.rootEndpoint + path).set('Authorization', this.authStr);
    } catch (e) {
      this.handleRequestException(e);
    }

    return res.body;
  }

  private async put(path: string, body: object): Promise<object> {
    let res;
    try {
      res = await request
        .put(this.rootEndpoint + path)
        .set('Authorization', this.authStr)
        .send(body);
    } catch (e) {
      this.handleRequestException(e);
    }

    return res.body;
  }

  private handleRequestException(e: any): void {
    // 处理异常
    let str;
    if (e.status === 401) {
      str = '接口请求失败！认证失败！用户名或 key 错误！';
    } else {
      const { body } = e.response;
      str = `接口请求失败！异常描述：错误码 ${body.errorCode}，错误信息 ${body.errorMessage}。`;
    }

    // 抛出新的异常
    throw new Error(str);
  }
}

CuccIotClient.mixin(apis);

export { Options, Status };
