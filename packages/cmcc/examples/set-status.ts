import { iccid, options } from './sample';
import { CmccIotClient, MobileNoType, OperationType } from '../src';

const cmccIotClient = new CmccIotClient(options);
cmccIotClient
  .setStatus(MobileNoType.iccid, iccid, OperationType.Deactivated2Activated)
  .then(res => console.log(res))
  .catch(err => console.error(err));
