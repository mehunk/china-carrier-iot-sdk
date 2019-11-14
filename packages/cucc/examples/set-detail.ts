import { iccid, options } from './sample';
import { CuccIotClient, Status } from '../src';

const cuccIotClient = new CuccIotClient(options);
cuccIotClient
  .setDetail(iccid, {
    status: Status.Deactivated
  })
  .then(res => console.log(res))
  .catch(err => console.error(err));
