// 设备状态
export enum Status {
  Activated = 'ACTIVATED', // 已激活。已激活状态的设备可以建立数据连接，而且将其视为计费。
  ActivationReady = 'ACTIVATION_READY', // 可激活。可激活状态的设备可以建立数据连接，但通常不考虑对其进行计费。当处于可激活状态的设备进行数据连接或发送短信时，Control Center 就会自动将其状态更改为已激活，从而开始对设备计费。
  Deactivated = 'DEACTIVATED', // 已停用。已停用状态不允许设备建立数据连接。通常不考虑对处于已停用状态的设备进行计费，除非适用某种承诺。通常，已停用设备已经部署，但临时处于非活动状态。
  Inventory = 'INVENTORY', // 库存。库存状态不允许设备建立数据连接。通常，不考虑对处于库存状态的设备进行计费。处于库存状态的设备的行为类似于处于已停用状态的行为。通常，处于库存状态的设备尚未部署，而已停用设备已经部署，但临时处于非活动状态。
  Purged = 'PURGED', // 已清除。已清除状态不允许设备建立数据连接。已清除状态的设备已由运营商从网络中实际移除，通常是作为对客户请求的响应或作为 SIM 卡更换策略的一部分。请联系您的运营商，以了解将设备变为已清除状态的策略。
  Replaced = 'REPLACED', // 已更换。在某些情况下，您可能需要将一个 SIM 卡更换为另一个 SIM 卡。新的 SIM 卡将继承原来的 SIM 卡的信息，而原来的 SIM 卡将变为已更换状态。您必须向运营商申请这种更改。
  Retired = 'RETIRED', // 已失效。已失效状态不允许设备建立数据连接。通常不考虑对处于此状态的设备进行计费，除非适用某种承诺。通常，已失效状态的设备永久处于非活动状态并且将变为已清除状态，以便将其从网络中移除。如有必要，用户可以将已失效设备变更为其他 SIM 卡状态。
  TestReady = 'TEST_READY' // 可测试。可测试状态允许设备可以建立数据连接并免费使用某些通信服务。此状态的 SIM 卡处于非计费状态。一旦设备达到为任何服务(流量、短信、通话或其他服务)配置的上限，该设备就会转换为目标状态，而无法再免费使用任何服务的测试通信。通常，超过可测试阈值的 SIM 卡的目标状态为可激活或库存。
}

// 确定设备在达到资费计划中定义的流量上限时的行为
export enum OverageLimitOverride {
  Default = 'DEFAULT', // 设备不能超过流量上限
  TemporaryOverride = 'TEMPORARY_OVERRIDE', // 设备可以使用任何数量的流量，直到当前计费周期结束，此时 Control Center 将开始实施资费计划中设置的流量上限
  PermanentOverride = 'PERMANENT_OVERRIDE' // 设备可以使用任何数量的流量，不考虑资费计划中定义的流量上限
}