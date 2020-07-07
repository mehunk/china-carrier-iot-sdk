import {
  SetGroupMemberEffectType,
  SetGroupMemberOperationType
} from '../types';

/**
 * 修改设备群组
 *
 * @param msisdn - 号码
 * @param groupId - 群组 id
 * @param operationType - 操作类型
 * @param effectType - 生效时间类型
 */
export async function setGroupMember(
  msisdn: string,
  groupId: string,
  operationType: SetGroupMemberOperationType,
  effectType?: SetGroupMemberEffectType
): Promise<void> {
  const url = '/manage/group-managment';
  await this.request(url, {
    msisdn,
    groupId,
    operType: operationType,
    effectType
  });
}
