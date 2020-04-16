import { GetUsageResponse } from '../types';

/**
 * 获取设备详情
 *
 * @param msisdn - MSISDN
 * @param includeDetail - 是否包含明细
 */
export async function getUsage(msisdn: string, includeDetail = false): Promise<GetUsageResponse> {
  const method = 'queryTraffic';
  const res = await this.request({
    method: 'GET',
    url: '/query.do',
    params: {
      method,
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_number: msisdn,
      needDtl: +includeDetail
    }
  }, [msisdn, method]);

  return res['web:NEW_DATA_TICKET_QRsp'];
}
