export interface GetUsageResponse {
  iccid: string;
  msisdn: string;
  imsi: string;
  totalVolumnGPRS: number;
  totalVolte: number;
  totalSMSUplink: number;
  totalSMSDownlink: number;
  results: {
    [key: string]: {
      volumeGPRS: {
        downlink: number;
        uplink: number;
        apn: string;
      }[];
    };
  };
}

export interface GetRealNameStatusResponse {
  commonRegionName: string;
  iccid: string;
  isAuth: boolean; // 是否实名认证,
  commonRegionId: string;
  imsi: string;
  msisdn: string;
  customerName: string;
  customerNo: string;
}
