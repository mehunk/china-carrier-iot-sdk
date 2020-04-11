import { GetStatusChangeHistoryResponse, MobileNoType } from '../types';

export async function getStatusChangeHistory(type: MobileNoType, id: string): Promise<GetStatusChangeHistoryResponse> {
  const url = '/query/sim-change-history';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
