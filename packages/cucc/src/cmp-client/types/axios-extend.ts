import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface AxiosRequestConfigExtend extends AxiosRequestConfig {
  requestTime: Date;
  traceId: string;
}

export interface AxiosErrorExtend extends AxiosError {
  config: AxiosRequestConfigExtend;
}

export interface AxiosResponseExtend extends AxiosResponse {
  config: AxiosRequestConfigExtend;
}
