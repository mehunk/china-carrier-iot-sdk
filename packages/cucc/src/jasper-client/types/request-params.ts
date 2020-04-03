import { Status, OverageLimitOverride } from './common';

export interface SetDetailParams {
  status?: Status;
  ratePlan?: string;
  communicationPlan?: string;
  customer?: string;
  deviceID?: string;
  modemID?: string;
  overageLimitOverride?: OverageLimitOverride;
}
