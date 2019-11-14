import { GetStatusResponse, MobileNoType } from '../types';

export async function getStatus(type: MobileNoType, id: string): Promise<GetStatusResponse> {
  const url = '/query/sim-status';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
