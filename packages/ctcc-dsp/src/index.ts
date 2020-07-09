import * as EventEmitter from 'events';

import * as _ from 'lodash';

import {
  GlobalSoapClient,
  MobileNoType as GlobalSoapClientMobileNoType,
  OperationType,
  GetDetailResponse,
  SetStatusResponse,
  Status,
  CustomOptions as SoapCustomOptions
} from './global-soap-client';
import {
  GlobalRestClient,
  MobileNoType as GlobalRestClientMobileNoType,
  DetailGroup,
  GetDetailResponse as GetGlobalRestDetailResponse
} from './global-rest-client';
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
  private readonly globalSoapOptions: ClientOptions;
  private readonly globalRestOptions: ClientOptions;
  private readonly restOptions: ClientOptions;
  private readonly customOptions: CustomOptions;
  private readonly restClient: RestClient;
  private readonly globalSoapClient: GlobalSoapClient;
  private readonly globalRestClient: GlobalRestClient;

  constructor(options: Options, customOptions: CustomOptions = {}) {
    super();
    this.globalSoapOptions = options.soap;
    this.globalRestOptions = options.soap;
    this.restOptions = options.rest;
    this.customOptions = customOptions;

    this.globalSoapClient = new GlobalSoapClient(this.globalSoapOptions, _.pick(this.customOptions, ['maxTimeoutMs', 'log']));
    this.restClient = new RestClient(this.restOptions, this.customOptions);
    this.globalRestClient = new GlobalRestClient(this.globalRestOptions, this.customOptions);
  }

  getDetail(type: GlobalSoapClientMobileNoType, id: string): Promise<GetDetailResponse> {
    return this.globalSoapClient.getDetail(type, id);
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
  setStatus(type: GlobalSoapClientMobileNoType, id: string, operationType: OperationType): Promise<SetStatusResponse> {
    return this.globalSoapClient.setStatus(type, id, operationType);
  }

  getRealNameStatus(mobileNoType: RestClientMobileNoType, id: string): Promise<GetRealNameStatusResponse> {
    return this.restClient.getRealNameStatus(mobileNoType, id);
  }

  getRestDetail(
    type: GlobalRestClientMobileNoType,
    id: string,
    detailGroups: DetailGroup[]
  ): Promise<GetGlobalRestDetailResponse> {
    return this.globalRestClient.getDetail(type, id, detailGroups);
  }

  unbindImei(
    iccid: string,
    customerNo: string,
    contactName: string,
    contactPhone: string
  ): Promise<void> {
    return this.restClient.unbindImei(iccid, customerNo, contactName, contactPhone);
  }
}

export {
  ClientOptions,
  Options,
  RestClientMobileNoType,
  GlobalSoapClientMobileNoType,
  GlobalRestClientMobileNoType,
  GetUsageType,
  OperationType,
  Status,
  DetailGroup
};
