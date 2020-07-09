import { MobileNoType, DetailGroup, GetDetailResponse } from '../types';

/**
 * 获取设备详情
 *
 * @param type - 号码类型
 * @param id - 号码
 * @param detailGroups - 号码详情组
 */
export async function getDetail(
  type: MobileNoType,
  id: string,
  detailGroups: DetailGroup[]
): Promise<GetDetailResponse> {
  const res = await this.request({
    method: 'POST',
    url: 'subscriptionManagement/v1/subscriptions/details',
    data: {
      type,
      values: [
        id
      ],
      groups: detailGroups
    }
  })

  return res['subscriptionDetails'][0];
}
