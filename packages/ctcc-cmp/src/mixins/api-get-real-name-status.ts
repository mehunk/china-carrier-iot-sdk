import * as _ from 'lodash';

import { GetStatusResponse, Status } from '../types';

/**
 * 获取实名认证状态
 *
 * @param msisdn - MSISDN
 */
export async function getRealNameStatus(msisdn: string): Promise<boolean> {
  const statusRes: GetStatusResponse = await this.getStatus(msisdn);
  if (!statusRes.productInfo || !statusRes.productInfo.length) {
    throw Error('获取实名状态失败！生命周期格式异常！');
  }

  const status = _.head(statusRes.productInfo);
  return status.productMainStatusCd !== Status.NotRealNameDeactivated;
}
