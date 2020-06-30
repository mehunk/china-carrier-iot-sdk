import { GetDetailResponse } from '../types';

/**
 * 获取设备详情
 *
 * @param iccid - ICCID
 */
export async function getDetail(iccid: string): Promise<GetDetailResponse> {
  const path = '/wsGetTerminalDetails/V1/1Main/vV1.1';
  const res = await this.request({
    method: 'POST',
    url: path,
    data: {
      openId: this.openId,
      version: '1.0',
      iccids: [ iccid ]
    }
  });

  return res.terminals[0];
}
