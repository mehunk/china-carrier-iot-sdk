import { OperationType, MobileNoType, SetStatusResponse } from '../types';

export async function setStatus(
  type: MobileNoType,
  id: string,
  operationType: OperationType
): Promise<SetStatusResponse> {
  try {
    const client = await this.getClient();
    const res = await client.RequestSubscriptionStatusChangeAsync({
      resource: {
        id,
        type
      },
      subscriptionStatus: operationType
    });
    return res[0];
  } catch (e) {
    console.error(e);
  }
}
