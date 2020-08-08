import { MobileNoType, GetStatusResponse } from '../types';

export function getStatus (mobileNoType: MobileNoType, mobileNo: string): Promise<GetStatusResponse> {
  const path = '/query/cardStatus';

  return this.request(path, {
    cardType: mobileNoType,
    cardId: mobileNo
  });
}
