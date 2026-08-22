import type { Measurement } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'

export interface JudgementCount {
  judgement: Judgement
  count: number
}

/**
 * 판정별 항목 수. 기준이 없는 항목은 판정 대상이 아니라 빼고 센다.
 *
 * 넣으면 '판정불가'가 *기준이 없어서*와 *구간을 벗어나서*를 뭉뚱그려
 * 숫자가 사실과 달라진다.
 */
export function countByJudgement(
  measurements: Measurement<Judgement>[],
  order: Judgement[],
): JudgementCount[] {
  return order
    .map((judgement) => ({
      judgement,
      count: measurements.filter((m) => m.hasCriteria && m.judgement === judgement).length,
    }))
    .filter((entry) => entry.count > 0)
}

/** 주의가 필요한 항목 — 질환의심만. */
export function selectAttention(measurements: Measurement<Judgement>[]) {
  return measurements.filter((m) => m.hasCriteria && m.judgement === 'suspect')
}

/**
 * 값이 어느 구간에도 걸리지 않은 항목 수.
 * 기준이 아예 없는 항목(신장·체중·시력·청력)은 '기준 없음'으로 따로 표시하므로 뺀다.
 */
export function countUndetermined(measurements: Measurement<Judgement>[]) {
  return measurements.filter((m) => m.hasCriteria && m.judgement === 'undetermined').length
}
