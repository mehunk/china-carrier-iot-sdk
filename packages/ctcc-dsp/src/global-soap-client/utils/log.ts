import { HttpLogObjInitParams, HttpLogObjParams, HttpLogObj } from '../types';

function createHttpLogObj(httpLogObjParams: HttpLogObjParams): HttpLogObj {
  const createdAt = new Date();
  const totalTime = createdAt.getTime() - httpLogObjParams.requestTime.getTime();
  return {
    createdAt,
    totalTime,
    ...httpLogObjParams
  };
}

export function createHttpLogObjFromError(httpLogObjParams: HttpLogObjInitParams, err: any): HttpLogObj {
  const httpLogObj = createHttpLogObj({
    ...httpLogObjParams,
    traceId: err.traceId,
    isError: true,
    error: {
      message: err.message
    }
  });
  const res = err.response;
  if (res) {
    httpLogObj.request.xml = res.request.body;
    httpLogObj.response = {
      status: res.statusCode,
      xml: res.body
    };
  }
  return httpLogObj;
}

export function createHttpLogObjFromResponse(httpLogObjParams: HttpLogObjInitParams, response: any[]): HttpLogObj {
  return createHttpLogObj({
    ...httpLogObjParams,
    traceId: response[4],
    request: {
      ...httpLogObjParams.request,
      xml: response[3]
    },
    response: {
      parsedObj: response[0],
      xml: response[1]
    },
    isError: false
  });
}
