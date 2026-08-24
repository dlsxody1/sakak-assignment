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
  /** '' = 미선택. 값은 LOGIN_TYPES의 value(`loginTypeLevel`)다 */
  loginTypeLevel: string
  /** 조회 시작 연도 (`yyyy`) */
  startDate: string
  /** 조회 종료 연도 (`yyyy`) */
  endDate: string
}

/** 폼이 채우는 값 전체 — 세션의 성별까지 포함한 제출 단위. */
export interface InquiryInput extends InquiryForm {
  sex: Sex | ''
}

/**
 * 통신사. **화면에는 6개, API에는 3개다.**
 *
 * 알뜰폰(MVNO) 사용자가 목록에서 자기 통신사를 못 찾으면 아무거나 고르거나 이탈한다.
 * 그렇다고 알뜰폰용 코드를 새로 만들 수는 없다 — CANDiY가 별도 코드를 받는지
 * probe로 확인되지 않았고(0/1/2만 검증), 미검증 값을 보내면 인증이 조용히 실패한다.
 * 그래서 알뜰폰 3종은 **모회사 망 코드를 그대로 쓴다**.
 *
 * 코드가 겹치므로 폼 상태에는 `code`가 아니라 `label`을 담는다 — 안 그러면 `SKT`를
 * 고를 때 `SKT 알뜰폰`도 같이 선택된 것처럼 보인다. 전송 직전에 `telecomCode`가 바꾼다.
 */
export const TELECOMS = [
  { code: '0', label: 'SKT' },
  { code: '1', label: 'KT' },
  { code: '2', label: 'LG U+' },
  { code: '0', label: 'SKT 알뜰폰' },
  { code: '1', label: 'KT 알뜰폰' },
  { code: '2', label: 'LG U+ 알뜰폰' },
] as const

/** `<select>`가 쓰는 형태. value가 곧 라벨이라 선택 상태가 겹치지 않는다. */
export const TELECOM_OPTIONS = TELECOMS.map(({ label }) => ({ value: label, label }))

/**
 * 고른 통신사 라벨 → CANDiY 코드.
 *
 * 못 찾으면 빈 문자열이다. 프록시의 필수 필드 검사에 걸려 CANDiY까지 가지 않는다 —
 * 틀린 코드를 보내 인증이 조용히 실패하는 것보다 낫다.
 */
export const telecomCode = (label: string) =>
  TELECOMS.find((telecom) => telecom.label === label)?.code ?? ''

/**
 * 간편인증 수단(`loginTypeLevel`).
 *
 * 하나로 고정하면 그 앱을 안 쓰는 사람은 조회 자체를 못 한다 — 전부 열어둔다.
 * 값은 CANDiY 스펙 그대로다. **`2`는 스펙에 없다** (1,3~13).
 * 순서는 스펙 번호순이 아니라 사용자가 찾기 쉬운 순 — 번호는 화면에 안 보인다.
 *
 * `slug`는 로고 파일명(`/auth/<slug>.svg`)이다. 라벨에서 유도하면 한글 파일명이 된다.
 * `color`·`mark`는 로고 파일이 아직 없을 때의 폴백 — 브랜드색 배경에 첫 글자를 얹는다.
 * 파일을 `public/auth/`에 떨구면 코드 수정 없이 로고로 바뀐다.
 *
 * `onDark`는 그 배경 위에 흰 글자를 얹어도 읽히는지다. 노란 계열(카카오·KB)은
 * 흰 글자가 대비에 미달해 검은 글자를 쓴다.
 */
export const LOGIN_TYPES = [
  { value: '1', label: '카카오톡', slug: 'kakao', color: '#FEE500', mark: '카', onDark: false },
  { value: '8', label: '토스', slug: 'toss', color: '#0064FF', mark: '토', onDark: true },
  { value: '5', label: '통신사(PASS)', slug: 'pass', color: '#E4002B', mark: 'P', onDark: true },
  { value: '6', label: '네이버', slug: 'naver', color: '#03C75A', mark: 'N', onDark: true },
  { value: '13', label: '카카오뱅크', slug: 'kakaobank', color: '#FFE300', mark: '뱅', onDark: false },
  { value: '4', label: '국민은행', slug: 'kb', color: '#FFBC00', mark: 'KB', onDark: false },
  { value: '7', label: '신한은행', slug: 'shinhan', color: '#0046FF', mark: '신', onDark: true },
  { value: '10', label: '하나은행', slug: 'hana', color: '#008485', mark: '하', onDark: true },
  { value: '12', label: '우리은행', slug: 'woori', color: '#0067AC', mark: '우', onDark: true },
  { value: '11', label: 'NH모바일인증서', slug: 'nh', color: '#00A64F', mark: 'NH', onDark: true },
  { value: '3', label: '삼성패스', slug: 'samsung', color: '#1428A0', mark: '삼', onDark: true },
  { value: '9', label: '뱅크샐러드', slug: 'banksalad', color: '#3B6EFB', mark: '뱅샐', onDark: true },
] as const

/** 고른 인증 수단의 이름. 대기 화면이 "카카오톡 앱에서 인증해 주세요"라고 말한다. */
export const loginTypeLabel = (value: string) =>
  LOGIN_TYPES.find((type) => type.value === value)?.label ?? '간편인증'

/**
 * 인증 단계.
 *
 * `idle` 폼 · `waiting` 앱 인증 대기 · `done` 결과 도착.
 * 1차 요청 중은 여기 없다 — mutation의 `isPending`이 이미 안다.
 * 스토어에 두면 같은 사실을 두 곳이 갖는다.
 */
export type InquiryStage = 'idle' | 'waiting' | 'done'
