import { CtccCmpIotClient } from '../src';
import { options, customOptions, msisdn } from './sample';

const ctccCmpIotClient = new CtccCmpIotClient(options, customOptions);
ctccCmpIotClient.activateActivationReady(msisdn)
  .then(res => console.dir(res, { depth: null }))
  .catch(err => console.error(err));
