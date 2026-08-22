import { describe, expect, it } from 'vitest'

import { describeSource } from './describe-source'
import type { CheckupHistory } from '../model/types'

const history = (dates: string[]): CheckupHistory => ({
  patientName: '홍길동',
  isSample: false,
  checkups: dates.map((date) => ({ date, evaluation: '', values: {} })) as never,
  visits: [],
  references: {} as never,
})

describe('describeSource', () => {
  it('예시 데이터는 접두로 밝힌다 — 뒤에 달면 훑을 때 안 읽힌다', () => {
    expect(describeSource(history(['2020-01-01', '2025-09-16']), true)).toBe(
      '예시 데이터 · 국민건강보험공단 검진 기록 2회차 (2020 – 2025)',
    )
  })

  it('실 데이터에는 접두가 없다', () => {
    expect(describeSource(history(['2020-01-01', '2025-09-16']), false)).toBe(
      '국민건강보험공단 검진 기록 2회차 (2020 – 2025)',
    )
  })

  it('회차가 한 해뿐이면 범위를 두 번 쓰지 않는다', () => {
    expect(describeSource(history(['2025-03-14']), false)).toBe(
      '국민건강보험공단 검진 기록 1회차 (2025)',
    )
  })

  it('정렬을 가정하지 않는다 — resultList는 최신순, overviewList는 오래된 순이다', () => {
    expect(describeSource(history(['2025-09-16', '2020-01-01']), false)).toContain('(2020 – 2025)')
  })
})
