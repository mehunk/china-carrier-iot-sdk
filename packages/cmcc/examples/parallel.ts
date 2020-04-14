import { iccid, options } from './sample';
import { CmccIotClient, MobileNoType } from '../src';

const iccids = (new Array(10)).fill(iccid);

const cmccIotClient = new CmccIotClient(options, {
  async log(obj) {}
});

Promise.all(iccids.map(iccid =>
  cmccIotClient.getStatus(MobileNoType.iccid, iccid))
).then(res => console.log(res))
  .catch(err => console.error(err))
  .finally(() => options.redis.disconnect());
