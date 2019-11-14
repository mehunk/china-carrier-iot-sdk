import { MobileNoType, GetUsageType, GetUsageResponse } from '../types';

export function getUsage(
  mobileNoType: MobileNoType,
  id: string,
  month: string,
  fromDate: string,
  toDate: string,
  type: GetUsageType[]
): Promise<GetUsageResponse> {
  const path = `/${mobileNoType}/${id}/trafficUsageHistory`;
  const requestBody = {
    type,
    month,
    from_date: fromDate /* eslint-disable-line @typescript-eslint/camelcase */,
    to_date: toDate /* eslint-disable-line @typescript-eslint/camelcase */
  };
  return this.request(path, requestBody);
}
