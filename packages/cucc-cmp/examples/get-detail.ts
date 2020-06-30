import { options, customOptions, iccid } from './sample';
import { CuccCmpClient } from '../src';

const cuccIotClient = new CuccCmpClient(options, customOptions);
cuccIotClient
  .getDetail(iccid)
  .then(res => console.log(res))
  .catch(err => console.error(err));
