import { MobileNoType, GetDetailResponse } from '../types';

export function getRealNameStatus (mobileNoType: MobileNoType, mobileNo: string): Promise<GetDetailResponse> {
  const path = '/handle/auth';

  return this.request(path, {
    cardType: mobileNoType,
    cardId: mobileNo
  });
}
