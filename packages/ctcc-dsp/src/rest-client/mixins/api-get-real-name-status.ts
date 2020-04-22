import { MobileNoType, GetRealNameStatusResponse } from '../types';

export function getRealNameStatus(mobileNoType: MobileNoType, id: string): Promise<GetRealNameStatusResponse> {
  return this.request({
    method: 'GET',
    url: '/ct/subscriptionQuery',
    params: {
      [mobileNoType]: id,
      isAuth: ''
    }
  });
}
