import { OperationType, SetStatusResponse } from '../types';

/**
 * 设置设备状态
 *
 * @param msisdn - MSISDN
 * @param operationType - 操作类型
 */
export async function setStatus(msisdn: string, operationType: OperationType): Promise<SetStatusResponse> {
  const method = 'disabledNumber';
  const res = await this.request({
    method: 'GET',
    url: '/query.do',
    params: {
      method,
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_number: msisdn,
      orderTypeId: operationType,
      acctCd: ''
    }
  }, [msisdn, operationType, method, '']);

  return res;
}
