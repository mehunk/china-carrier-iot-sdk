import { GetStatusResponse } from '../types';

export async function getStatus(msisdn: string): Promise<GetStatusResponse> {
  const method = 'queryCardMainStatus';
  return this.request({
    method: 'GET',
    url: '/query.do',
    params: {
      method,
      // eslint-disable-next-line @typescript-eslint/camelcase
      access_number: msisdn
    }
  }, [msisdn, method]);
}
