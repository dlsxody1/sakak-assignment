import type { InquiryForm } from '../model/types'

/**
 * CANDiY 요청 바디. 1차·2차가 공유한다 —
 * 2차는 여기에 `isContinue`와 `multiFactorInfo`만 더한다.
 *
 * 형태의 출처는 `scripts/probe-candiy.sh`의 BASE다. 실제로 호출해서 확인한 것이라
 * 추측으로 필드를 바꾸지 않는다.
 *
 * `loginTypeLevel: '8'` = 토스, `inquiryType: '0'` = 전체 조회.
 * `id`를 인자로 받는 이유는 순수성이다 — 안에서 randomUUID를 부르면 테스트가 고정 못 한다.
 */
export function buildInquiryBody(form: InquiryForm, id: string) {
  return {
    id,
    loginTypeLevel: '8',
    legalName: form.legalName.trim(),
    birthdate: form.birthdate,
    phoneNo: form.phoneNo,
    telecom: form.telecom,
    startDate: form.startDate,
    endDate: form.endDate,
    inquiryType: '0',
  }
}
