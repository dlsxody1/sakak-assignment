import { telecomCode, type InquiryForm } from '../model/types'

/**
 * CANDiY 요청 바디. 1차·2차가 공유한다 —
 * 2차는 여기에 `isContinue`와 `multiFactorInfo`만 더한다.
 *
 * 형태의 출처는 `scripts/probe-candiy.sh`의 BASE다. 실제로 호출해서 확인한 것이라
 * 추측으로 필드를 바꾸지 않는다.
 *
 * `loginTypeLevel`은 폼이 정한다 — 고정하면 그 앱을 안 쓰는 사람이 조회를 못 한다.
 * `inquiryType: '0'` = 일반조회. 대시보드가 PDF·문진을 쓰지 않아 고정이다.
 * `id`를 인자로 받는 이유는 순수성이다 — 안에서 randomUUID를 부르면 테스트가 고정 못 한다.
 *
 * `telecom`은 폼이 라벨로 들고 있어서 여기서 코드로 바꾼다 — 알뜰폰과 모회사가
 * 같은 코드를 쓰기 때문이다(`telecomCode` 주석 참고).
 */
export function buildInquiryBody(form: InquiryForm, id: string) {
  return {
    id,
    loginTypeLevel: form.loginTypeLevel,
    legalName: form.legalName.trim(),
    birthdate: form.birthdate,
    phoneNo: form.phoneNo,
    telecom: telecomCode(form.telecom),
    startDate: form.startDate,
    endDate: form.endDate,
    inquiryType: '0',
  }
}
