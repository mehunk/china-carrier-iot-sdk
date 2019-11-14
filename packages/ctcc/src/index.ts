import {
  SoapClient,
  MobileNoType as SoapClientMobileNoType,
  OperationType,
  GetDetailResponse,
  SetStatusResponse
} from './soap-client';
import { RestClient, MobileNoType as RestClientMobileNoType, GetUsageType, GetUsageResponse } from './rest-client';
import { ClientOptions, Options } from './types';
import config from './config';

export class CtccIotClient {
  private readonly soapOptions: ClientOptions;
  private readonly restOptions: ClientOptions;
  private readonly restClient: RestClient;
  private readonly soapClient: SoapClient;

  constructor(options: Options) {
    this.soapOptions = options.soap;
    this.restOptions = options.rest;

    this.restClient = new RestClient(this.restOptions.username, this.restOptions.password, config.restRootEndpoint);

    this.soapClient = new SoapClient(this.soapOptions.username, this.soapOptions.password, config.soapRootEndpoints);
  }

  async init(): Promise<void> {
    await this.soapClient.init();
  }

  async getDetail(type: SoapClientMobileNoType, id: string): Promise<GetDetailResponse> {
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
  async getUsage(
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
  async setStatus(type: SoapClientMobileNoType, id: string, operationType: OperationType): Promise<SetStatusResponse> {
    return this.soapClient.setStatus(type, id, operationType);
  }
}

export { RestClientMobileNoType, SoapClientMobileNoType, GetUsageType, OperationType };
