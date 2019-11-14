import { options, iccid } from './sample';
import { CtccIotClient, SoapClientMobileNoType, OperationType } from '../src';

const ctccIotClient = new CtccIotClient(options);
ctccIotClient
  .init()
  .then(() => ctccIotClient.setStatus(SoapClientMobileNoType.iccid, iccid, OperationType.Activate))
  .then(res =>
    console.dir(res, {
      depth: null
    })
  );
