import { GetDetailResponse } from '../types';

/**
 * 获取设备详情
 *
 * @param iccid - ICCID
 */
export function getDetail(iccid: string): Promise<GetDetailResponse> {
  const path = `/devices/${iccid}`;
  return this.get(path);
}
