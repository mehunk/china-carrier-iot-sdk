import { options, iccid } from './sample';
import { CtccDspIotClient, GlobalRestClientMobileNoType, DetailGroup } from '../src';

const ctccDspIotClient = new CtccDspIotClient(options);
ctccDspIotClient
  .getRestDetail(GlobalRestClientMobileNoType.iccid, iccid, [DetailGroup.lockStateInfo])
  .then(res =>
    console.dir(res, {
      depth: null
    })
  )
  .catch(err => {
    console.error(err);
  });
