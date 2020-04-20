import * as EventEmitter from 'events';
import * as assert from 'assert';

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
  ImeiChangeEventData,
  EventResponse,
  eventType2Name
} from './jasper-client';
import { CmpClient, CustomOptions as CmpCustomOptions, GetRealNameStatusResponse } from './cmp-client';
import { CmpClientOptions, JasperClientOptions, Options, MobileNoObj } from './types';

export interface CustomOptions extends JasperCustomOptions, CmpCustomOptions {}

export class CuccIotClient extends EventEmitter {
  private readonly jasperOptions: JasperClientOptions;
  private readonly cmpOptions: CmpClientOptions;
  private readonly customOptions: CustomOptions;
  private readonly jasperClient: JasperClient;
  private readonly cmpClient: CmpClient;

  // on: (event: 'cucc-imeiChange', listener: (imeiChangeEventData: ImeiChangeEventData, eventParams: EventParams) => void) => this;

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

  static async parseEventData (eventDataStr: string): Promise<EventData> {
    try {
      return await parseStringPromise(eventDataStr, {
        explicitArray: false,
        explicitRoot: false,
        ignoreAttrs: true
      })
    } catch (e) {
      throw new Error(`无效的回调事件参数！原始参数：${eventDataStr}`);
    }
  }

  static async getMobileNoTypeFromEvent(eventParams: EventParams): Promise<MobileNoObj> {
    const eventData = await this.parseEventData(eventParams.data);

    return {
      iccid: eventData.iccid
    };
  }

  async handleEvent(eventParams: EventParams): Promise<EventResponse> {
    // 后期需要校验签名

    // xml 转换
    const eventData = await CuccIotClient.parseEventData(eventParams.data);
    const eventName = eventType2Name[eventParams.eventType];
    assert(eventName, `没有配置事件类型为${eventParams.eventType}的事件名称映射！`);

    switch (eventParams.eventType) {
      case EventType.ImeiChange:
        this.emit(eventName, eventData as ImeiChangeEventData, eventParams);
        break;
      default:
        throw new Error(`没有对应${eventParams.eventType}事件的处理方法！`);
    }

    return {
      eventName,
      eventData: eventData as ImeiChangeEventData,
      eventParams
    }
  }
}

export { Options, Status, EventParams, EventData, ImeiChangeEventData, EventResponse };
