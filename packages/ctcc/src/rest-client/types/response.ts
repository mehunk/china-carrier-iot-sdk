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
