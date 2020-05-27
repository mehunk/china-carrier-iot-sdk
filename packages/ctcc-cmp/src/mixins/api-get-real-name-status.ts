import * as _ from 'lodash';

import { GetRealNameStatusResponse } from '../types';

/**
 * 获取实名认证状态
 *
 * @param msisdn - MSISDN
 */
export async function getRealNameStatus(msisdn: string): Promise<boolean> {
  const method = 'realNameQueryIot';
  const res: GetRealNameStatusResponse = await this.request({
    method: 'GET',
    url: '/query.do',
    params: {
      method,
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_number: msisdn
    }
  }, [msisdn, method]);

  return res.resultCode === '0';
}
