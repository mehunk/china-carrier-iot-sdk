export interface GetDetailResponse {
  icc: string; // "8986112021008602501",
  imsi: string; // "460113823464307",
  msisdn: string; // "861410820081257",
  subscriptionState: string; // "ACTIVE",
  imei: string; // "862589043555142",
  companyId: string; // "57000077",
  lockState: string; // "UNLOCKED", "LOCKED", "UNKNOWN"
  lockingReason?: string;
}
