import { MobileNoType, GetDetailResponse } from '../types';

export function getDetail (mobileNoType: MobileNoType, mobileNo: string): Promise<GetDetailResponse> {
  const path = '/query/cardInfo';

  return this.request(path, {
    cardType: mobileNoType,
    cardId: mobileNo
  });
}
