import { options, iccid } from './sample';
import { CuccIotClient } from '../src';

const cuccIotClient = new CuccIotClient(options);
cuccIotClient
  .getUsage(iccid)
  .then(res => console.log(res))
  .catch(err => console.error(err));
