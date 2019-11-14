import { MobileNoType, GetDetailResponse } from '../types';

export async function getDetail(type: MobileNoType, id: string): Promise<GetDetailResponse> {
  try {
    const client = await this.getClient();
    const res = await client.QuerySimResource_v2Async({
      resource: {
        id,
        type
      }
    });
    return res[0]['simResource'][0];
  } catch (e) {
    console.error(e);
  }
}
