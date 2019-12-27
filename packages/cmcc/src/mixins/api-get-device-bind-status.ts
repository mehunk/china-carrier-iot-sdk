import { GetDeviceBindStatusResponse, DeviceBindStatusCheckType } from '../types';

/**
 * 获取机卡分离状态
 *
 * @param msisdn - 号码
 * @param checkType - 检测类型（0：话单侧检测，1：网络侧检测）
 * @returns 机卡分离状态
 */
export async function getDeviceBindStatus(msisdn: string, checkType: DeviceBindStatusCheckType): Promise<GetDeviceBindStatusResponse> {
  const url = '/query/card-bind-status';
  const result = await this.request(url, {
    msisdn,
    testType: checkType
  });
  return result[0];
}
