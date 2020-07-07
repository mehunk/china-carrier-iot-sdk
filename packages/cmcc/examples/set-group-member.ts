import { msisdn, groupId, options, redis } from './sample';
import { CmccIotClient, SetGroupMemberOperationType } from '../src';

const cmccIotClient = new CmccIotClient(options);
cmccIotClient
  .setGroupMember(msisdn, groupId, SetGroupMemberOperationType.Remove)
  .then(res => console.log(res))
  .catch(err => console.error(err))
  .finally(() => redis.disconnect());
