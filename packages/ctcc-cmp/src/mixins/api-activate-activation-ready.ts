import { ActivateActivationReadyResponse } from '../types';

/**
 * 激活可激活设备
 *
 * @param msisdn - MSISDN
 * @param operationType - 操作类型
 */
export function activateActivationReady(msisdn: string): Promise<ActivateActivationReadyResponse> {
  const method = 'requestServActive';
  return this.request({
    method: 'GET',
    url: '/query.do',
    params: {
      method,
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_number: msisdn,
    }
  }, [msisdn, method]);
}
