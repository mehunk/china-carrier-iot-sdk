export interface JasperClientOptions {
  username: string;
  key: string;
  rootEndpoint?: string;
}

export interface CmpClientOptions {
  appId: string;
  appSecret: string;
  rootEndpoint?: string;
}

export interface Options {
  jasper: JasperClientOptions;
  cmp: CmpClientOptions;
}

export interface MobileNoObj {
  iccid?: string;
  msisdn?: string;
}
