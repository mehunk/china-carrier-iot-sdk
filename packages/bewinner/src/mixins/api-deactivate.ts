import { MobileNoType, HandelResponse } from '../types';

export function deactivate (mobileNoType: MobileNoType, mobileNo: string): Promise<HandelResponse> {
  const path = '/handle/stopDevice';

  return this.request(path, {
    cardType: mobileNoType,
    cardId: mobileNo
  });
}
