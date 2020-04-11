import { GetLastPositionWgs84Response, MobileNoType } from '../types';

/**
 * 获取最后上网位置经纬度（API25L02）
 *
 * @param type 号码类型
 * @param id 号码
 */
export async function getLastPositionWgs84(type: MobileNoType, id: string): Promise<GetLastPositionWgs84Response> {
  const url = '/query/last-position-location';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
