import { MobileNoType, HandelResponse } from '../types';

export function reactivate (mobileNoType: MobileNoType, mobileNo: string): Promise<HandelResponse> {
  const path = '/handle/openDevice';

  return this.request(path, {
    cardType: mobileNoType,
    cardId: mobileNo
  });
}
