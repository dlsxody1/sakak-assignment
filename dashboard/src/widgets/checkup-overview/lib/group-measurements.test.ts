import { describe, expect, it } from 'vitest'

import type { Measurement, MeasurementKey } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'
import { groupMeasurements } from './group-measurements'

const measurement = (
  key: MeasurementKey,
  judgement: Judgement,
  hasCriteria = true,
): Measurement<Judgement> =>
  ({
    key,
    label: key,
    unit: '',
    value: '1',
    judgement,
    hasCriteria,
    criteria: { normalA: '', normalB: '', suspect: '' },
    series: [],
  }) as Measurement<Judgement>

describe('groupMeasurements', () => {
  it('묶음별로 나눈다', () => {
    const groups = groupMeasurements([
      measurement('bloodPressure', 'suspect'),
      measurement('AST', 'normalA'),
    ])

    expect(groups.map((g) => g.label)).toEqual(['혈압', '간'])
  })

  it('질환의심 수를 센다 — 접혀 있어도 문제를 알 수 있게', () => {
    const groups = groupMeasurements([
      measurement('AST', 'suspect'),
      measurement('ALT', 'suspect'),
      measurement('yGPT', 'normalA'),
    ])

    expect(groups[0]).toMatchObject({ label: '간', suspectCount: 2 })
  })

  it('기준 없는 항목은 질환의심으로 세지 않는다', () => {
    const groups = groupMeasurements([measurement('height', 'undetermined', false)])

    expect(groups[0].suspectCount).toBe(0)
  })

  it('빈 묶음은 버린다', () => {
    const groups = groupMeasurements([measurement('bloodPressure', 'suspect')])

    expect(groups).toHaveLength(1)
  })
})
