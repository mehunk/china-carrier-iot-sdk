import { msisdn, options } from './sample';
import { CmccIotClient, DeviceBindStatusCheckType } from '../src';

const cmccIotClient = new CmccIotClient(options);
cmccIotClient
  .getDeviceBindStatus(msisdn, DeviceBindStatusCheckType.Ticket)
  .then(res => console.log(res))
  .catch(err => console.error(err));
