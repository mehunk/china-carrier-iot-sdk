import { Status } from './common';

// 获取设备详情
export interface GetDetailResponse {
  msisdn: string; // "861400069552122",
  iccid: string; // "89860619160018521225",
  imsi: string; // "460068166152122",
  imei: string; // "",
  deviceId: string; // "200601160909022157",
  simStatus: Status; // 生命周期状态
  realNameStatus: string; // 实名制状态，0: 不需实名未实名，1: 需要实名未实名，2: 需要实名已实名，3: 不需要实名已实名
  ratePlan: number; // 21003113,
  monthToDateUsage: string; // 本月用量，单位 MB，"0",
  monthToDateDataUsage: string; // 本月数据用量，单位 MB，"0",
  monthToDateSMSUsage: string; // "0",
  monthToDateSMSUsageMO: string; // "0",
  monthToDateVoiceUsage: string; // "0",
  monthToDateVoiceUsageMO: string; // "0",
  dateShipped: string; // 发货日期，"2020-06-22 00:00:00",
  dateModified: string; // 修改日期，"2020-06-22 11:13:34.0",
  dateAdded: string; // 添加日期，"2020-06-22 10:54:50.0",
  dateActivated: string; // 激活日期，""
  dateReceivied: string; // "2020-06-22 10:58:41",
  accountId: string; // "190901000029805971",
  operatorAccountId: string; // "791WLW001421",
  modemId: string; // "",
  secureSimId: string; // "1",
  lockStatus: string; // "0",
  Customer: string; // "200608000010440044",
  ctdSessionCount: number; // 0,
  overageLimitOverride: string; // "0",
  fixedIpAddress: string; // "",
  simNotes: string; // "",
  copyRulePwd: string; // "1",
  overageLimitReached: string; // "197010",
  fieldValue1: string; // "",
  fieldValue2: string; // "",
  fieldValue3: string; // "",
  fieldValue4: string; // "",
  fieldValue5: string; // "",
  fieldValue6: string; // "",
  fieldValue7: string; // "",
  fieldValue8: string; // "",
  fieldValue9: string; // "",
  fieldValue10: string; // "",
  customerCustom1: string; // "",
  customerCustom2: string; // "",
  customerCustom3: string; // "",
  customerCustom4: string; // "",
  customerCustom5: string; // "",
  operatorCustom1: string; // "",
  operatorCustom2: string; // "",
  operatorCustom3: string; // "",
  operatorCustom4: string; // "",
  operatorCustom5: string; // "",
  provinceCusutom1: string; // "",
  provinceCusutom2: string; // "",
  provinceCusutom3: string; // "",
  provinceCusutom4: string; // "",
  provinceCusutom5: string; // "",
}

// 接口基础响应内容
interface ApiBasicResponse {
  messageId: string; // "200601007122189938",
  resultCode: string; // "1104",
  resultDesc?: string; // "账户阻止状态变更为预激活状态",
  timestamp: string; // "2020-06-30 14:46:40",
  version: string; // "1.0"
}

// 修改设备属性响应内容
export interface SetDetailResponse extends ApiBasicResponse {
  iccid?: string;
  effectiveDate?: string; // 生效时间
}
