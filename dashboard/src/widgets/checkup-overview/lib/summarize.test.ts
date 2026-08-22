import { describe, expect, it } from 'vitest'

import type { Measurement } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'
import { countByJudgement, countUndetermined, selectAttention } from './summarize'

const ORDER: Judgement[] = ['suspect', 'undetermined', 'normalB', 'normalA', 'unmeasured']

const measurement = (
  judgement: Judgement,
  hasCriteria = true,
): Measurement<Judgement> =>
  ({
    key: 'BMI',
    label: '체질량지수',
    unit: '',
    value: '25',
    judgement,
    hasCriteria,
    criteria: { normalA: '', normalB: '', suspect: '' },
    series: [],
  }) as Measurement<Judgement>

describe('countByJudgement', () => {
  it('기준이 없는 항목은 세지 않는다', () => {
    // 신장·체중·시력·청력은 기준이 아예 없어 판정불가로 떨어지지만 판정 대상이 아니다.
    const counts = countByJudgement(
      [measurement('undetermined', false), measurement('undetermined', true)],
      ORDER,
    )

    expect(counts).toEqual([{ judgement: 'undetermined', count: 1 }])
  })

  it('나쁜 것부터 정렬한다', () => {
    const counts = countByJudgement(
      [measurement('normalA'), measurement('suspect'), measurement('normalB')],
      ORDER,
    )

    expect(counts.map((c) => c.judgement)).toEqual(['suspect', 'normalB', 'normalA'])
  })

  it('0건인 판정은 빼서 범례가 비지 않게 한다', () => {
    expect(countByJudgement([measurement('suspect')], ORDER)).toEqual([
      { judgement: 'suspect', count: 1 },
    ])
  })
})

describe('selectAttention', () => {
  it('질환의심만 고른다', () => {
    const attention = selectAttention([
      measurement('suspect'),
      measurement('undetermined'),
      measurement('normalA'),
    ])

    expect(attention).toHaveLength(1)
  })
})

describe('countUndetermined', () => {
  it('기준이 있는데 구간을 벗어난 것만 센다', () => {
    expect(
      countUndetermined([measurement('undetermined', true), measurement('undetermined', false)]),
    ).toBe(1)
  })
})
