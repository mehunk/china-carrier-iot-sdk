import { options, iccid, customOptions, redis } from './sample';
import { CtccIotClient, SoapClientMobileNoType, OperationType } from '../src';

const ctccIotClient = new CtccIotClient(options, customOptions);
ctccIotClient
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
