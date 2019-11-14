import { MobileNoType, GetUsageResponse } from '../types';

export async function getUsage(type: MobileNoType, id: string): Promise<GetUsageResponse> {
  const url = '/query/sim-data-usage';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
