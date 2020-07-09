export enum Status {
  Active = 'Active', // 激活
  Pause = 'Pause', // 停机保号，文档上写的是 Paused，但实际结果应该是 Pause
  Deactivated = 'Deactivated', // 普通停机
  Terminated = 'Terminated' // 已拆机
}

export interface GetDetailResponse {
  msisdn: string;
  imsi: string;
  icc: string;
  pin1: string;
  pin2: string;
  puk1: string;
  puk2: string;
  imei: string;
  assignedImei: string;
  customerNo: string;
  accessControlClass: string;
  roamProfileName: string;
  deviceTerminalType: string;
  simSubscriptionStatus: Status;
  simCardDescription: string;
  simSpecification: string;
  priceProfileName: string;
  productOfferName: string;
  pdpContextProfileName: string;
  firstActivationDate: string;
  gprs: boolean;
  smsMo: boolean;
  smsMt: boolean;
  csd: boolean;
  voice: boolean;
  clip: boolean;
  consumerConnectivity: string;
  apns: {
    apn: {
      name: string;
      description: string;
    }[];
  };
  installationDate: string;
  pbrExitDate: string;
  lastSubscriptionDateChange: string;
  moveToPermitted: string;
  freezeDuration: string;
  chargeCodeForPPMove: boolean;
  chargeCodeNonPPMove: boolean;
}

export interface SetStatusResponse {
  serviceRequestId: string;
}
