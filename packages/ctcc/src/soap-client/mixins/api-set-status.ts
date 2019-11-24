import { OperationType, MobileNoType, SetStatusResponse } from '../types';

export async function setStatus(
  type: MobileNoType,
  id: string,
  operationType: OperationType
): Promise<SetStatusResponse> {
  const res = await this.request('/SubscriptionManagement', 'RequestSubscriptionStatusChange', {
    resource: {
      id,
      type
    },
    subscriptionStatus: operationType
  });

  try {
    return res.data;
  } catch (e) {
    throw new Error(`接口响应结果格式异常！traceId：${res.traceId}`);
  }
}
