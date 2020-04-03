import * as _ from 'lodash';

import {
  JasperClient,
  GetDetailResponse,
  GetUsageResponse,
  SetDetailResponse,
  SetDetailParams,
  CustomOptions as JasperCustomOptions
} from './jasper-client';
import { CmpClient, GetRealNameStatusResponse, CustomOptions as CmpCustomOptions } from './cmp-client';
import { JasperClientOptions, CmpClientOptions, Options } from './types';

export interface CustomOptions extends JasperCustomOptions, CmpCustomOptions {}

export class CuccIotClient {
  private readonly jasperOptions: JasperClientOptions;
  private readonly cmpOptions: CmpClientOptions;
  private readonly customOptions: CustomOptions;
  private readonly jasperClient: JasperClient;
  private readonly cmpClient: CmpClient;

  constructor(options: Options, customOptions: CustomOptions = {}) {
    this.jasperOptions = options.jasper;
    this.cmpOptions = options.cmp;
    this.customOptions = customOptions;

    this.jasperClient = new JasperClient(this.jasperOptions, _.pick(this.customOptions, ['maxTimeoutMs', 'log']));
    this.cmpClient = new CmpClient(this.cmpOptions, this.customOptions);
  }

  async getDetail(iccid: string): Promise<GetDetailResponse> {
    return this.jasperClient.getDetail(iccid);
  }

  async getUsage(iccid: string): Promise<GetUsageResponse> {
    return this.jasperClient.getUsage(iccid);
  }

  async setDetail(iccid: string, detailParams: SetDetailParams): Promise<SetDetailResponse> {
    return this.jasperClient.setDetail(iccid, detailParams);
  }

  async getRealNameStatus(iccid: string): Promise<GetRealNameStatusResponse> {
    return this.cmpClient.getRealNameStatus(iccid);
  }
}

export { Options };
