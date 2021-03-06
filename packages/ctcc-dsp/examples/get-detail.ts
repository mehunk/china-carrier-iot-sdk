import { options, iccid, customOptions, redis } from './sample';
import { CtccDspIotClient, GlobalSoapClientMobileNoType } from '../src';

const ctccDspIotClient = new CtccDspIotClient(options, customOptions);
ctccDspIotClient
  .getDetail(GlobalSoapClientMobileNoType.iccid, iccid)
  .then(res =>
    console.dir(res, {
      depth: null
    })
  )
  .catch(err => {
    console.error(err);
  })
  .finally(() => redis.disconnect());
