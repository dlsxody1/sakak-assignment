import type { Sex } from '@/entities/user'

/**
 * 인증 폼 입력값. 전부 문자열이다 — CANDiY가 숫자를 받지 않는다.
 *
 * 성별은 여기 없다. `entities/user`의 세션이 갖고 있고 폼은 그걸 직접 채운다
 * (판정이 쓰는 값이라 인증이 끝나도 남아야 한다).
 */
export interface InquiryForm {
  legalName: string
  birthdate: string
  phoneNo: string
  /** '' = 미선택. 값은 TELECOMS의 value다 */
  telecom: string
  startDate: string
  endDate: string
}

/** 폼이 채우는 값 전체 — 세션의 성별까지 포함한 제출 단위. */
export interface InquiryInput extends InquiryForm {
  sex: Sex | ''
}

/** 통신사. 화면에는 라벨만 보이고 API에는 value가 간다. */
export const TELECOMS = [
  { value: '0', label: 'SKT' },
  { value: '1', label: 'KT' },
  { value: '2', label: 'LG U+' },
] as const

/**
 * 인증 단계.
 *
 * `idle` 폼 · `waiting` 앱 인증 대기 · `done` 결과 도착.
 * 1차 요청 중은 여기 없다 — mutation의 `isPending`이 이미 안다.
 * 스토어에 두면 같은 사실을 두 곳이 갖는다.
 */
export type InquiryStage = 'idle' | 'waiting' | 'done'
