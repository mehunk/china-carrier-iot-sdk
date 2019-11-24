export interface HttpLogObjInitParams {
  requestTime: Date;
  request: {
    url: string;
    methodName: string;
    args: object;
  };
}

export interface HttpLogObjParams extends HttpLogObjInitParams {
  traceId: string;
  request: {
    url: string;
    methodName: string;
    args: object;
    xml?: string;
  };
  response?: {
    status?: number;
    parsedObj?: object;
    xml: string;
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
