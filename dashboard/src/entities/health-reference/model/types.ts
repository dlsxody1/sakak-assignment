/** 검진 항목 하나의 판정 결과. */
export type Judgement =
  /** 정상(A) 구간 */
  | 'normalA'
  /** 정상(B) 구간 */
  | 'normalB'
  /** 질환의심 구간 */
  | 'suspect'
  /** 측정값이 없다 (빈 문자열) */
  | 'unmeasured'
  /** 기준이 없거나, 어느 구간에도 걸리지 않거나, 기준 문자열을 해석하지 못했다 */
  | 'undetermined'

export type Sex = 'male' | 'female'

/** referenceList의 refType 3종에서 뽑은 한 항목의 기준값 원문. */
export interface ReferenceValues {
  normalA: string
  normalB: string
  suspect: string
}

/**
 * 기준 문자열을 파싱한 중간표현.
 *
 * 파싱 시점에 `/`의 의미(성별분기·수축기이완기·합집합)를 판별해 두므로
 * 판정 함수는 값을 구간에 넣어보기만 한다.
 */
export type Criterion =
  | { kind: 'lt' | 'lte' | 'gt' | 'gte'; value: number }
  /** 양끝 포함 */
  | { kind: 'range'; min: number; max: number }
  /** 정규화 후 완전일치. `이상` 서열은 파싱 시점에 펼쳐 넣는다 */
  | { kind: 'text'; accepts: string[] }
  /** `18.5미만/25~29.9` 처럼 불연속 구간의 합집합 */
  | { kind: 'union'; of: Criterion[] }
  | { kind: 'bySex'; male: Criterion; female: Criterion }
  /** 수축기/이완기 두 값을 각각 보고 and/or로 합친다 */
  | { kind: 'bloodPressure'; systolic: Criterion; diastolic: Criterion; op: 'and' | 'or' }
