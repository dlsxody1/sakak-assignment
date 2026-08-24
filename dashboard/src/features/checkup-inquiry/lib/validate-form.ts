import type { InquiryInput } from '../model/types'

/** 필드별 오류 메시지. 비어 있으면 통과다. */
export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>

/**
 * 제출 전 검증.
 *
 * 형식만 본다 — 실명·번호가 실제로 존재하는지는 CANDiY만 안다.
 * 형식 오류를 미리 걸러야 4분 30초를 헛되이 쓰지 않는다.
 */
export function validateInquiry(input: InquiryInput): InquiryErrors {
  const errors: InquiryErrors = {}

  if (!input.legalName.trim()) {
    errors.legalName = '이름을 입력해 주세요.'
  }

  if (!/^\d{8}$/.test(input.birthdate)) {
    errors.birthdate = '생년월일을 8자리 숫자로 입력해 주세요. 예: 19900101'
  }

  if (!/^010\d{8}$/.test(input.phoneNo)) {
    errors.phoneNo = '휴대폰 번호를 하이픈 없이 11자리로 입력해 주세요. 예: 01012345678'
  }

  if (!input.telecom) {
    errors.telecom = '통신사를 선택해 주세요.'
  }

  if (!input.loginTypeLevel) {
    errors.loginTypeLevel = '인증 수단을 선택해 주세요.'
  }

  // 시작이 종료보다 뒤면 CANDiY가 무엇을 돌려줄지 모른다. 보내기 전에 막는다.
  if (Number(input.startDate) > Number(input.endDate)) {
    errors.startDate = '조회 시작 연도가 종료 연도보다 뒤일 수 없습니다.'
  }

  if (!input.sex) {
    errors.sex = '판정 기준으로 쓸 성별을 선택해 주세요.'
  }

  return errors
}
