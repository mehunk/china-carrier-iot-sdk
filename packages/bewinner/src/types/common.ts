// 设备状态
export enum Status {
  TestReady,// 可测试
  ActivationReady, // 可激活
  Activated, // 已激活
  UserDeactivated, // 用户主动停机
  OutOfCreditDeactivated, // 欠费停机
  ExpiredPlanDeactivated, // 套餐失效停机
  Purged, // 注销
  Retired, // 预销号停机
  ExpiredPlanActivated, // 套餐失效正使用
  Replaced, // 挂失
  Handling, // 处理中
  Initial // 空卡
}
