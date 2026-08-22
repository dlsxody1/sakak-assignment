import type { MeasurementKey } from './types'

/**
 * 판정을 입힌 검사 항목 하나. 위젯·피처가 공유한다.
 *
 * `judgement`를 `string`으로 두는 건 느슨해서가 아니라 경계 때문이다 —
 * `checkup`은 `health-reference`를 import할 수 없다(같은 레이어의 다른 슬라이스).
 * 실제 판정 타입으로 좁히는 건 둘이 만나는 위젯의 몫이다.
 */
export interface Measurement<TJudgement extends string = string> {
  key: MeasurementKey
  label: string
  unit: string
  /** 최신 회차 측정값. 결측이면 null. */
  value: string | null
  judgement: TJudgement
  /** 판정 기준이 아예 없는 항목 — 배지 대신 '기준 없음'을 보여준다. */
  hasCriteria: boolean
  /** 기준 원문. 근거를 펼쳤을 때 그대로 보여준다. */
  criteria: MeasurementCriteria
  /** 오래된 순 6회차. 결측은 null이라 차트에 구멍이 난다. */
  series: MeasurementPoint<TJudgement>[]
}

export interface MeasurementCriteria {
  normalA: string
  normalB: string
  suspect: string
}

export interface MeasurementPoint<TJudgement extends string = string> {
  date: string
  value: string | null
  judgement: TJudgement
}
