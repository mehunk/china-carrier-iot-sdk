import { options, customOptions, iccid } from './sample';
import { CuccIotClient } from '../src';

const cuccIotClient = new CuccIotClient(options, customOptions);
cuccIotClient
  .getDetail(iccid)
  .then(res => console.log(res))
  .catch(err => console.error(err));
