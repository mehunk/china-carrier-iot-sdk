export interface Options {
  userId: string;
  password: string;
  key: string;
  rootEndpoint?: string;
}

export interface CustomOptions {
  log?: (obj: object) => Promise<void>;
  maxTimeoutMs?: number;
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

