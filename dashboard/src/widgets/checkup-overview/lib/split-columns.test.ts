import { describe, expect, it } from 'vitest'

import type { MeasurementGroup } from './group-measurements'
import { splitColumns } from './split-columns'

function group(label: string, itemCount: number): MeasurementGroup {
  return {
    label,
    items: Array.from({ length: itemCount }, (_, i) => ({ key: `${label}-${i}` })) as never,
    suspectCount: 0,
  }
}

describe('splitColumns', () => {
  it('모든 묶음을 빠짐없이 배분한다', () => {
    const groups = [group('계측', 6), group('혈압', 1), group('지질', 4), group('간', 3)]
    const [left, right] = splitColumns(groups)

    expect([...left, ...right]).toHaveLength(groups.length)
    expect([...left, ...right].map((g) => g.label).sort()).toEqual(
      groups.map((g) => g.label).sort(),
    )
  })

  it('원래 순서를 열 안에서 유지한다', () => {
    const groups = [group('계측', 6), group('혈압', 1), group('당뇨', 1), group('지질', 4)]
    const [left, right] = splitColumns(groups)

    const order = groups.map((g) => g.label)
    for (const column of [left, right]) {
      const indices = column.map((g) => order.indexOf(g.label))
      expect(indices).toEqual([...indices].sort((a, b) => a - b))
    }
  })

  it('실제 7묶음 21항목에서 두 열 높이가 크게 벌어지지 않는다', () => {
    const groups = [
      group('계측', 6),
      group('혈압', 1),
      group('당뇨', 1),
      group('지질', 4),
      group('신장', 3),
      group('간', 3),
      group('기타', 3),
    ]
    const [left, right] = splitColumns(groups)
    const rows = (column: MeasurementGroup[]) =>
      column.reduce((sum, g) => sum + g.items.length + 1, 0)

    // 총 28줄. 한 묶음(최대 7줄)보다 더 벌어지면 배분이 실패한 것이다.
    expect(Math.abs(rows(left) - rows(right))).toBeLessThanOrEqual(7)
    expect(left.length).toBeGreaterThan(0)
    expect(right.length).toBeGreaterThan(0)
  })

  it('묶음이 하나뿐이면 왼쪽에만 넣는다', () => {
    const [left, right] = splitColumns([group('계측', 6)])

    expect(left).toHaveLength(1)
    expect(right).toHaveLength(0)
  })

  it('빈 입력을 견딘다', () => {
    expect(splitColumns([])).toEqual([[], []])
  })
})
