import { options, iccid } from './sample';
import { CtccIotClient, SoapClientMobileNoType } from '../src';

const ctccIotClient = new CtccIotClient(options);
ctccIotClient
  .init()
  .then(() => ctccIotClient.getDetail(SoapClientMobileNoType.iccid, iccid))
  .then(res =>
    console.dir(res, {
      depth: null
    })
  );
