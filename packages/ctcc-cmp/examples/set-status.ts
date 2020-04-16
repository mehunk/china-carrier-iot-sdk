import { CtccCmpIotClient, OperationType } from '../src';
import { options, customOptions, msisdn } from './sample';

const ctccCmpIotClient = new CtccCmpIotClient(options, customOptions);
ctccCmpIotClient.setStatus(msisdn, OperationType.Deactivated2Activated)
  .then(res => console.dir(res, { depth: null }))
  .catch(err => console.error(err));
