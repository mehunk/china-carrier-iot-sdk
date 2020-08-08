import { MobileNoType, HandelResponse } from '../types';

export function activate (mobileNoType: MobileNoType, mobileNo: string): Promise<HandelResponse> {
  const path = '/handle/active';

  return this.request(path, {
    cardType: mobileNoType,
    cardId: mobileNo
  });
}
