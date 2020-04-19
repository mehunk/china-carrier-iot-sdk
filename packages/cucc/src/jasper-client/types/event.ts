// 推送事件类型
export enum EventType {
  ImeiChange = 'IMEI_CHANGE', // 更换设备
}

// 推送事件参数
export interface EventParams {
  eventId: string;
  eventType: EventType;
  timestamp: string;
  signature: string;
  signature2: string;
  data: string;
}

export interface ImeiChangeEventData {
  iccid: string;
  previousImei: string;
  currentImei: string;
  dateChanged: string;
}

export type EventData = ImeiChangeEventData;
