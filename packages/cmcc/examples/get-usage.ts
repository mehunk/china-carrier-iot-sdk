import { options, iccid } from './sample';
import { CmccIotClient, MobileNoType } from '../src';

const cmccIotClient = new CmccIotClient(options);
cmccIotClient
  .getUsage(MobileNoType.iccid, iccid)
  .then(res => console.log(res))
  .catch(err => console.error(err));
