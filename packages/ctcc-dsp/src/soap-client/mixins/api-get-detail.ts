import { MobileNoType, GetDetailResponse } from '../types';

export async function getDetail(type: MobileNoType, id: string): Promise<GetDetailResponse> {
  const res = await this.request('/SubscriptionManagement', 'QuerySimResource_v2', {
    resource: {
      id,
      type
    }
  });

  try {
    return res.data['simResource'][0];
  } catch (e) {
    throw new Error(`接口响应结果格式异常！traceId：${res.traceId}`);
  }
}
