import { SetDetailParams, SetDetailResponse } from '../types';

/**
 * 设置设备状态
 *
 * @param iccid - ICCID
 * @param detailParams - 目标属性对象
 */
export function setDetail(iccid: string, detailParams: SetDetailParams): Promise<SetDetailResponse> {
  const path = `/devices/${iccid}`;
  return this.put(path, detailParams);
}
