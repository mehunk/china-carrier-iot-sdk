import { GetDetailResponse, MobileNoType } from '../types';

/**
 * 获取设备详情
 *
 * @param type 号码类型
 * @param id 号码
 */
export async function getDetail(type: MobileNoType, id: string): Promise<GetDetailResponse> {
  const url = '/query/sim-basic-info';
  const result = await this.request(url, {
    [type]: id
  });
  return result[0];
}
