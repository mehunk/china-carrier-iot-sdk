import { MobileNoType } from './request-params';

export enum Status {
  TestReady = '6',
  Inventory = '7',
  ActivationReady = '1',
  Activated = '2',
  Deactivated = '4',
  Retired = '8',
  Purged = '9'
}

export interface GetStatusResponse {
  cardStatus: Status; // 1: 待激活, 2: 已激活, 4: 停机, 6: 可测试, 7: 库存, 8: 预销户, 9: 已销户
  lastChangeDate: string;
}

export interface GetUsageResponse {
  dataAmount: string;
}

export interface GetDeviceBindStatusResponse {
  result: string; // 0：已分离，1：未分离，2：查询失败
  errorCode: string;
  errorDes: string;
  sepTime: string;
}

export type SetStatusResponse = {
  [key in keyof typeof MobileNoType]: string;
};

export interface GetDetailResponse {
  msisdn: string;
  imsi: string;
  iccid: string;
  activateDate: string; // 激活时间
  openDate: string; // 开卡时间
}

export interface GetStatusChangeHistoryResponse {
  changeHistoryList: {
    descStatus: Status;
    targetStatus: Status;
    changeDate: string;
  }[];
}

export interface GetCurrentPositionCityCodeResponse {
  cityCode: string;
}

export interface GetCurrentPositionWgs84Response {
  lat: string;
  lon: string;
}

export interface GetLastPositionCityCodeResponse {
  onLineTime: string;
  mobileCountryCode: string;
  cityCode: string;
}

export interface GetLastPositionWgs84Response {
  lastTime: string;
  lastLat: string;
  lastLon: string;
}
