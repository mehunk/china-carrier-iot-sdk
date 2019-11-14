/**
 * 目前支持的操作类型
 *
 * 0: 申请停机(已激活转已停机)
 * 1: 申请复机(已停机转已激活)
 * 2: 库存转已激活
 * 3: 可测试转库存
 * 4: 可测试转待激活
 * 5: 可测试转已激活
 * 6: 待激活转已激活
 */

import { MobileNoType, OperationType, SetStatusResponse } from '../types';

/**
 * 修改设备状态
 *
 * @param type - 号码类型
 * @param id - 号码
 * @param operationType - 操作类型
 */
export async function setStatus<T>(
  type: MobileNoType,
  id: string,
  operationType: OperationType
): Promise<SetStatusResponse> {
  const url = '/change/sim-status';
  const result = await this.request(url, {
    [type]: id,
    operType: operationType
  });
  return result[0];
}
