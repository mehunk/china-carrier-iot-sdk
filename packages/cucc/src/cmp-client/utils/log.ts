import * as _ from 'lodash';
import { HttpLogObjParams, HttpLogObj, AxiosErrorExtend, AxiosResponseExtend } from '../types';

export function createHttpLogObj(httpLogObjParams: HttpLogObjParams): HttpLogObj {
  const createdAt = new Date();
  const totalTime = createdAt.getTime() - httpLogObjParams.requestTime.getTime();
  return {
    createdAt,
    totalTime,
    ...httpLogObjParams
  };
}

export function createHttpLogObjFromError(err: AxiosErrorExtend): HttpLogObj {
  return createHttpLogObj({
    traceId: err.config.traceId,
    requestTime: err.config.requestTime,
    isError: true,
    error: {
      message: err.message
    },
    request: _.pick(err.config, ['url', 'method', 'headers', 'data'])
  });
}

export function createHttpLogObjFromResponse(response: AxiosResponseExtend): HttpLogObj {
  return createHttpLogObj({
    traceId: response.config.traceId,
    isError: false,
    requestTime: response.config.requestTime,
    request: _.pick(response.config, ['url', 'method', 'params', 'headers', 'data']),
    response: _.pick(response, ['status', 'headers', 'data'])
  });
}
