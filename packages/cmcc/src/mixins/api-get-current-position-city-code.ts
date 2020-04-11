import { GetCurrentPositionCityCodeResponse, MobileNoType } from '../types';

/**
 * 获取实时位置区号（API25L01）
 *
 * @param type 号码类型
 * @param id 号码
 */
export async function getCurrentPositionCityCode(type: MobileNoType, id: string): Promise<GetCurrentPositionCityCodeResponse> {
  const url = '/query/district-position-location-message';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
