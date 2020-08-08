import { MobileNoType, GetDetailResponse } from '../types';

export function getUsage (mobileNoType: MobileNoType, mobileNo: string): Promise<GetDetailResponse> {
  const path = '/query/flowMonthNow';

  return this.request(path, {
    cardType: mobileNoType,
    cardId: mobileNo
  });
}
