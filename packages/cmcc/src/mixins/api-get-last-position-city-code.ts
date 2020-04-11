import { GetLastPositionCityCodeResponse, MobileNoType } from '../types';

/**
 * 获取最后上网位置区号（API25L04）
 *
 * @param type 号码类型
 * @param id 号码
 */
export async function getLastPositionCityCode(type: MobileNoType, id: string): Promise<GetLastPositionCityCodeResponse> {
  const url = '/query/last-district-position';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
