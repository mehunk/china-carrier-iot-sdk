import { options, iccid, customOptions, redis } from './sample';
import { CtccDspIotClient, RestClientMobileNoType, GetUsageType } from '../src';

const ctccDspIotClient = new CtccDspIotClient(options, customOptions);
ctccDspIotClient
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
