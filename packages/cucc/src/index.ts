import * as EventEmitter from 'events';

import * as _ from 'lodash';
import { parseStringPromise } from 'xml2js';

import {
  CustomOptions as JasperCustomOptions,
  GetDetailResponse,
  GetUsageResponse,
  JasperClient,
  SetDetailParams,
  SetDetailResponse,
  Status,
  EventParams,
  EventType,
  EventData,
  ImeiChangeEventData
} from './jasper-client';
import { CmpClient, CustomOptions as CmpCustomOptions, GetRealNameStatusResponse } from './cmp-client';
import { CmpClientOptions, JasperClientOptions, Options } from './types';

export interface CustomOptions extends JasperCustomOptions, CmpCustomOptions {}

export class CuccIotClient extends EventEmitter {
  private readonly jasperOptions: JasperClientOptions;
  private readonly cmpOptions: CmpClientOptions;
  private readonly customOptions: CustomOptions;
  private readonly jasperClient: JasperClient;
  private readonly cmpClient: CmpClient;

  on: (event: 'cucc-imeiChange', listener: (imeiChangeEventData: ImeiChangeEventData, eventParams: EventParams) => void) => this;

  constructor(options: Options, customOptions: CustomOptions = {}) {
    super();
    this.jasperOptions = options.jasper;
    this.cmpOptions = options.cmp;
    this.customOptions = customOptions;

    this.jasperClient = new JasperClient(this.jasperOptions, _.pick(this.customOptions, ['maxTimeoutMs', 'log']));
    this.cmpClient = new CmpClient(this.cmpOptions, this.customOptions);
  }

  async getDetail(iccid: string): Promise<GetDetailResponse> {
    return this.jasperClient.getDetail(iccid);
  }

  async getUsage(iccid: string): Promise<GetUsageResponse> {
    return this.jasperClient.getUsage(iccid);
  }

  async setDetail(iccid: string, detailParams: SetDetailParams): Promise<SetDetailResponse> {
    return this.jasperClient.setDetail(iccid, detailParams);
  }

  async getRealNameStatus(iccid: string): Promise<GetRealNameStatusResponse> {
    return this.cmpClient.getRealNameStatus(iccid);
  }

  async handleEvent(eventParams: EventParams): Promise<void> {
    // 后期需要校验签名

    // xml 转换
    let eventData: EventData = null;
    try {
      eventData = await parseStringPromise(eventParams.data, {
        explicitArray: false,
        explicitRoot: false,
        ignoreAttrs: true
      });
    } catch {}

    switch (eventParams.eventType) {
      case EventType.ImeiChange:
        this.emit('cucc-imeiChange', eventData as ImeiChangeEventData, eventParams);
        break;
      default:
        throw new Error(`没有对应${eventParams.eventType}事件的处理方法！`);
    }
  }
}

export { Options, Status, EventParams, ImeiChangeEventData };
