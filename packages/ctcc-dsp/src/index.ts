import * as EventEmitter from 'events';

import * as _ from 'lodash';

import {
  SoapClient,
  MobileNoType as SoapClientMobileNoType,
  OperationType,
  GetDetailResponse,
  SetStatusResponse,
  Status,
  CustomOptions as SoapCustomOptions
} from './soap-client';
import {
  RestClient,
  MobileNoType as RestClientMobileNoType,
  GetUsageType,
  GetUsageResponse,
  GetRealNameStatusResponse,
  CustomOptions as RestCustomOptions
} from './rest-client';
import { ClientOptions, Options } from './types';

export interface CustomOptions extends RestCustomOptions, SoapCustomOptions {}

export class CtccDspIotClient extends EventEmitter {
  private readonly soapOptions: ClientOptions;
  private readonly restOptions: ClientOptions;
  private readonly customOptions: CustomOptions;
  private readonly restClient: RestClient;
  private readonly soapClient: SoapClient;

  constructor(options: Options, customOptions: CustomOptions = {}) {
    super();
    this.soapOptions = options.soap;
    this.restOptions = options.rest;
    this.customOptions = customOptions;

    this.soapClient = new SoapClient(this.soapOptions, _.pick(this.customOptions, ['maxTimeoutMs', 'log']));
    this.restClient = new RestClient(this.restOptions, this.customOptions);
  }

  getDetail(type: SoapClientMobileNoType, id: string): Promise<GetDetailResponse> {
    return this.soapClient.getDetail(type, id);
  }

  /**
   * 获取号码使用量
   *
   * @param mobileNoType - 号码类型
   * @param id - 号码
   * @param month - 月份
   * @param fromDate - 开始日期
   * @param toDate - 截止日期
   * @param type - 查询类型
   */
  getUsage(
    mobileNoType: RestClientMobileNoType,
    id: string,
    month: string,
    fromDate: string,
    toDate: string,
    type: GetUsageType[]
  ): Promise<GetUsageResponse> {
    return this.restClient.getUsage(mobileNoType, id, month, fromDate, toDate, type);
  }

  /**
   * 更改设备状态
   *
   * @param type - 号码类型
   * @param id - 号码
   * @param operationType - 操作类型
   */
  setStatus(type: SoapClientMobileNoType, id: string, operationType: OperationType): Promise<SetStatusResponse> {
    return this.soapClient.setStatus(type, id, operationType);
  }

  getRealNameStatus(mobileNoType: RestClientMobileNoType, id: string): Promise<GetRealNameStatusResponse> {
    return this.restClient.getRealNameStatus(mobileNoType, id);
  }
}

export { ClientOptions, Options, RestClientMobileNoType, SoapClientMobileNoType, GetUsageType, OperationType, Status };
