import { GetUsageResponse } from '../types';

export function getUsage(iccid: string): Promise<GetUsageResponse> {
  const path = `/devices/${iccid}/ctdUsages`;
  return this.get(path);
}
