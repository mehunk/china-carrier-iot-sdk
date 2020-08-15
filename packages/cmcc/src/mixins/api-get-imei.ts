import { MobileNoType } from '../types';

/**
 * 获取设备详情
 *
 * @param type 号码类型
 * @param id 号码
 */
export async function getImei(type: MobileNoType, id: string): Promise<string> {
  const url = '/query/sim-imei';
  const result = await this.request(url, {
    [type]: id
  });

  if (!result[0]) {
    throw new Error('imei不存在！');
  }
  return result[0].imei;
}
