import * as redis from 'ioredis';

export interface Options {
  appId: string;
  password: string;
  redis: redis.Redis;
  lockKey: string;
  rootEndpoint?: string;
}

export interface AccessTokenObj {
  token: string;
  expireTime: number;
}

export interface HttpLogObjParams {
  traceId: string;
  requestTime: Date;
  request: {
    url?: string;
    method?: string;
    params?: object;
    headers?: string;
    data?: string | object;
  };
  response?: {
    status?: number;
    headers?: object;
    data?: string | object;
  };
  isError: boolean;
  error?: {
    message: string;
  };
}

export interface HttpLogObj extends HttpLogObjParams {
  createdAt: Date;
  totalTime: number;
}
