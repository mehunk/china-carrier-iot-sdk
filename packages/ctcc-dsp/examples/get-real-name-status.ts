import { options, iccid, customOptions, redis } from './sample';
import { CtccDspIotClient, RestClientMobileNoType } from '../src';

const ctccDspIotClient = new CtccDspIotClient(options, customOptions);
ctccDspIotClient
  .getRealNameStatus(RestClientMobileNoType.iccid, iccid)
  .then(res =>
    console.dir(res, {
      depth: null
    })
  )
  .catch(err => {
    console.error(err);
  })
  .finally(() => redis.disconnect());
