import { options, iccid, customOptions, redis } from './sample';
import { CtccDspIotClient, SoapClientMobileNoType, OperationType } from '../src';

const ctccDspIotClient = new CtccDspIotClient(options, customOptions);
ctccDspIotClient
  .setStatus(SoapClientMobileNoType.iccid, iccid, OperationType.Activate)
  .then(res =>
    console.dir(res, {
      depth: null
    })
  )
  .catch(err => {
    console.error(err);
  })
  .finally(() => redis.disconnect());
