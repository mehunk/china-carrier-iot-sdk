import { GetCurrentPositionWgs84Response, MobileNoType } from '../types';

/**
 * 获取实时位置经纬度（API25L00）
 *
 * @param type 号码类型
 * @param id 号码
 */
export async function getCurrentPositionWgs84(type: MobileNoType, id: string): Promise<GetCurrentPositionWgs84Response> {
  const url = '/query/position-location-message';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
