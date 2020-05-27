export enum Status {
  TestReady = '2',
  Inventory = '3',
  ActivationReady = '1',
  Activated = '4',
  Deactivated = '5',
  Purged = '7',
  NotRealNameDeactivated = '6' // 未实名停机
}

export interface GetUsageResponse {
  CHARGE_CNT_CH: string;
  DURATION_CNT_CH: string;
  IRESULT: string;
  TOTALCOUNT: string;
  TOTALPAGE: string;
  TOTAL_BYTES_CNT: string; // 格式为 *.** MB,
  GROUP_TRANSACTIONID: string;
  number: string; // msisdn
}

export interface GetStatusResponse {
  resultCode: string; // '0',
  resultMsg: string; // '处理成功！',
  GROUP_TRANSACTIONID: string; // '1000000190202004151866131400',
  number: string; // '1410403452215',
  servCreateDate: string; // '20200304',
  productInfo: {
    productMainStatusCd: Status; // '4'
    productMainStatusName: string; // '在用'
  }[];
}

export interface SetStatusResponse {
  RspType: string; // '0',
  result: string; // '0',
  resultMsg: string; // '处理成功！',
  GROUP_TRANSACTIONID: string; // '1000000190202004162026784683'
}

export interface ActivateActivationReadyResponse {
  RESULT: string; // '0',
  SMSG: string; // '处理成功！',
  GROUP_TRANSACTIONID: string; // '1000000190202004162027753742'
}

export interface GetRealNameStatusResponse {
  RESULT: {
    activeTime: string;
    prodStatusName: string; // '未激活'
    prodMainStatusName: string; // '运营商管理状态'
    certNumber: string; // 'null'
    number: string;
  },
  resultCode: string; // '-5',
  resultMsg: string; // '未能查询到实名制信息',
  GROUP_TRANSACTIONID: string;
}
