import { Status, SetDetailResponse } from '../types';

/**
 * 修改设备详情
 *
 * @param iccid - ICCID
 * @param changeType - 修改属性类型
 * @param targetValue - 要修改的目标值
 * @param asynchronous - 异步
 */
export function setDetail(
  iccid: string,
  changeType: string,
  targetValue: Status | string,
  asynchronous = '0'
): Promise<SetDetailResponse> {
  const path = '/wsEditTerminal/V1/1Main/vV1.1';
  return this.request({
    method: 'POST',
    url: path,
    data: {
      openId: this.openId,
      version: '1.0',
      iccid,
      asynchronous,
      changeType,
      targetValue
    }
  });
}
