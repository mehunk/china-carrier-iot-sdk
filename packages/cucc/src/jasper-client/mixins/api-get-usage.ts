import { GetUsageResponse } from '../types';

export function getUsage(iccid: string): Promise<GetUsageResponse> {
  const path = `/devices/${iccid}/ctdUsages`;
  return this.request({
    method: 'GET',
    url: path
  });
}
