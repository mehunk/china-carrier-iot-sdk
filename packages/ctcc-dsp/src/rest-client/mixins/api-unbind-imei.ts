export async function unbindImei(
  iccid: string,
  customerNo: string,
  contactName: string,
  contactPhone: string
): Promise<void> {
  await this.request({
    method: 'POST',
    url: '/unlock/simbind',
    data: {
      iccid,
      customerNo,
      contactName,
      contactPhone
    }
  });
}
