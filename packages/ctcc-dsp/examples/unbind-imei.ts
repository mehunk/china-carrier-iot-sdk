import { options, iccid, customOptions, redis } from './sample';
import { CtccDspIotClient } from '../src';

const ctccDspIotClient = new CtccDspIotClient(options, customOptions);
ctccDspIotClient
  .unbindImei(
    iccid,
    '57000077',
    '张强',
    '13923847275'
  )
  .then(res =>
    console.dir(res, {
      depth: null
    })
  )
  .catch(err => {
    console.error(err);
  })
  .finally(() => redis.disconnect());
