import { options, iccid, customOptions, redis } from './sample';
import { CtccIotClient, RestClientMobileNoType, GetUsageType } from '../src';

const ctccIotClient = new CtccIotClient(options, customOptions);
ctccIotClient
  .getUsage(RestClientMobileNoType.iccid, iccid, '2019-11', '1', '10', [GetUsageType.GPRS])
  .then(res =>
    console.dir(res, {
      depth: null
    })
  )
  .catch(err => {
    console.error(err);
  })
  .finally(() => redis.disconnect());
