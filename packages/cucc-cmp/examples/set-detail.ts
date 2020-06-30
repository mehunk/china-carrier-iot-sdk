import { options, customOptions, iccid } from './sample';
import { CuccCmpClient } from '../src';

const cuccIotClient = new CuccCmpClient(options, customOptions);
cuccIotClient
  .setDetail(iccid, '3', '3')
  .then(res => console.log(res))
  .catch(err => console.error(err));
