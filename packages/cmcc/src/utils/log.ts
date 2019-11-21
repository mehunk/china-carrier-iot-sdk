import * as _ from 'lodash';
import { AxiosError, AxiosResponse } from 'axios';

import { HttpLogObjParams, HttpLogObj } from '../types';

export function createHttpLogObj(httpLogObjParams: HttpLogObjParams): HttpLogObj {
  return {
    createdAt: new Date(),
    ...httpLogObjParams
  };
}

export function createHttpLogObjFromError(traceId: string, requestTime: Date, err: AxiosError): HttpLogObj {
  return createHttpLogObj({
    traceId,
    requestTime,
    isError: true,
    error: {
      message: err.message
    },
    request: _.pick(err.config, ['url', 'method', 'headers', 'data'])
  });
}

export function createHttpLogObjFromResponse(traceId: string, requestTime: Date, response: AxiosResponse): HttpLogObj {
  return createHttpLogObj({
    traceId,
    isError: false,
    requestTime,
    request: _.pick(response.config, ['url', 'method', 'params', 'headers', 'data']),
    response: _.pick(response, ['status', 'headers', 'data'])
  });
}
