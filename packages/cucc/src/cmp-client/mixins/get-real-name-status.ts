import { GetRealNameStatusResponse } from '../types';

/**
 * 获取实名状态
 *
 * @param iccid - ICCID
 */
export function getRealNameStatus(iccid: string): Promise<GetRealNameStatusResponse> {
  const path = `/realNameStatusQuery/V1/1Main/vV1.1`;
  return this.request({
    method: 'POST',
    url: path,
    data: {
      iccid: iccid.substring(0, 19)
    }
  });
}
