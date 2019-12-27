export enum MobileNoType {
  iccid = 'iccid',
  msisdn = 'msisdn',
  imsi = 'imsi'
}

export enum OperationType {
  Activated2Deactivated,
  Deactivated2Activated,
  Inventory2Activated,
  TestReady2Inventory,
  TestReady2ActivationReady,
  TestReady2Activated,
  ActivationReady2Activated
}

export enum DeviceBindStatusCheckType {
  Ticket,
  Network
}

export interface QueryObj {
  [key: string]: string | number;
}
