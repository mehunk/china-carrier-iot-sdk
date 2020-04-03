import { Status, OverageLimitOverride } from './common';

export interface GetDetailResponse {
  iccid: string; // 设备的 ICCID
  imsi: string; // 设备的 IMSI
  msisdn: string; // 设备的 MSISDN 或电话号码
  imei: string; // 设备的 IMEI
  status: Status; // 设备的 SIM 卡状态。有关有效值的列表，请参阅 SIM 卡状态值
  ratePlan: string; // 与设备关联的资费计划的名称
  communicationPlan: string; // 与设备关联的通信计划的名称
  customer: string; // 与此设备关联的客户名称(如果有，通常是企业或业务部门)
  endConsumerId: string; // 与此设备关联的人员(如果有)的 ID
  dateActivated: string; // 首次激活设备的日期。请参阅日期格式了解详细信息
  dateUpdated: string; // 上次更新设备信息的日期。请参阅日期格式了解详细信息
  dateShipped: string; // 设备 SIM 卡从运营商库存转移到企业账户的日期。请参阅日期格式了解详细信息
  accountId: string; // 与设备关联的企业账户的 ID
  fixedIPAddress: string; // 如果与设备关联的通信计划使用固定 IP 地址，则为与此设备关联的 IP 地址。如果通信计划使用动态 IP 地址，则此字段将为空
  simNotes: string; // 运营商添加的有关设备的信息
  euiccid: string;
  deviceID: string; // 账户或客户可为设备分配的可选标识符
  modemID: string; // 标识设备用于传输数据的调制解调器
  globalSimType: string; // 对于利用 Control Center 的全球 SIM 卡功能的企业，该值指示设备是使用主要运营商的主 SIM 卡还是合作伙伴运营商的虚拟订购
}

export interface SetDetailResponse {
  iccid: string;
}

export interface GetUsageResponse {
  iccid: string; // 设备的 ICCID
  imsi: string; // 设备的 IMSI
  msisdn: string; // 设备的 MSISDN 或电话号码
  imei: string; // 设备的 IMEI
  status: Status; // 设备的 SIM 卡状态。有关有效值的列表，请参阅 SIM 卡状态值
  ratePlan: string; // 与设备关联的资费计划的名称
  communicationPlan: string; // 与设备关联的通信计划的名
  ctdDataUsage: number; // 自计费周期开始后使用的流量(以字节计)。
  ctdSMSUsage: number; // 自计费周期开始后的移动台始发消息和移动台终止消息的计数
  ctdVoiceUsage: number; // 自计费周期开始后使用的通话秒数
  ctdSessionCount: number; // 自计费周期开始后的数据会话数量
  overageLimitReached: boolean; // 指示设备是否达到资费计划中设置的流量上限
  overageLimitOverride: OverageLimitOverride; // 指示设备能否超过资费计划中指定的流量上限
}
