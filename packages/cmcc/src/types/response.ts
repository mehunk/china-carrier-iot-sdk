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

export type SetStatusResponse = {
  [key in keyof typeof MobileNoType]: string;
};
