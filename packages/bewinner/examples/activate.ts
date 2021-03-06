import { BewinnerClient, MobileNoType } from '../src';
import { options, iccid } from './sample';

const bewinnerClient = new BewinnerClient(options);

bewinnerClient.activate(MobileNoType.iccid, iccid)
  .then(res => console.log(res))
  .catch(err => console.error(err));
