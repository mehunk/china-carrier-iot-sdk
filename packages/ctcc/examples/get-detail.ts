import { options, iccid, customOptions, redis } from './sample';
import { CtccIotClient, SoapClientMobileNoType } from '../src';

const ctccIotClient = new CtccIotClient(options, customOptions);
ctccIotClient
  .getDetail(SoapClientMobileNoType.iccid, iccid)
  .then(res =>
    console.dir(res, {
      depth: null
    })
  )
  .catch(err => {
    console.error(err);
  })
  .finally(() => redis.disconnect());
