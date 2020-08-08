import { Status } from './common';

export interface Response {
  respStatus: {
    code: string;
    msg: string;
  },
  respBody: GetDetailResponse | GetStatusResponse | HandelResponse;
}

export interface GetDetailResponse {
  iccid: string;
  imsi: string;
  msisdn: string;
  netType: string; // "NORMAL",
  category: string; // "NPLUGGABLE",
  size: string; // "TRIPLE_CUT",
  operator: string; // "CTCC",
  packages: {
    code: string; // "CTCC_CMP_DCP_LADDER_15777721286913605",
    pkgName: string; // "中国电信非定向CMP单卡阶梯套餐"
  }[]
}

export interface GetStatusResponse {
  cardId: string;
  status: Status;
  activateTime: string; // "20200522134417"
}

export interface GetUsageResponse {
  updateTime: string; // "20200807193246",
  total: number | null;
  left: number | null;
  used: number | null;
}

export interface HandelResponse {
  serviceRequestId: string; // "oaj_123_202008071935360211305"
}

export interface GetRealNameStatusResponse {
  requestId: string | null;
  flag: false;
}
