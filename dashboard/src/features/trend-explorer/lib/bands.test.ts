import { describe, expect, it } from 'vitest'

import { toAxisRange, toBandLayout, toBands } from './bands'

const COLORS = { normalA: 'a', normalB: 'b', suspect: 's' }
const LABELS = { normalA: '정상 A', normalB: '정상 B', suspect: '질환의심' }
const bands = (criteria: Parameters<typeof toBands>[0], bounds = { min: 100, max: 250 }) =>
  toBands(criteria, COLORS, LABELS, bounds)

describe('toBands', () => {
  it('범위와 부등호를 띠로 바꾼다 (총콜레스테롤)', () => {
    const result = bands({ normalA: '200미만', normalB: '200-239', suspect: '240이상' })

    expect(result).toHaveLength(3)
    expect(result[0]).toMatchObject({ to: 200, color: 'a' })
    expect(result[1]).toMatchObject({ from: 200, to: 239, color: 'b' })
    expect(result[2]).toMatchObject({ from: 240, color: 's' })
  })

  it('무한대는 데이터 범위에 맞춰 잘린다', () => {
    const result = bands({ normalA: '200미만', normalB: '', suspect: '' })

    expect(Number.isFinite(result[0].from)).toBe(true)
    expect(result[0].from).toBeLessThan(100)
  })

  it('성별 분기는 한 축에 못 그리므로 건너뛴다', () => {
    expect(bands({ normalA: '남: 13-16.5 / 여: 12-15.5', normalB: '', suspect: '' })).toEqual([])
  })

  it('혈압 복합 조건도 건너뛴다', () => {
    expect(bands({ normalA: '120미만 이며/80미만', normalB: '', suspect: '' })).toEqual([])
  })

  it('기준이 비면 띠가 없다', () => {
    expect(bands({ normalA: '', normalB: '', suspect: '' })).toEqual([])
  })

  it('범위 밖으로 완전히 벗어난 띠는 버린다', () => {
    // 데이터가 0-10인데 기준이 240이상이면 그릴 자리가 없다.
    expect(bands({ normalA: '', normalB: '', suspect: '240이상' }, { min: 0, max: 10 })).toEqual([])
  })
})

describe('toAxisRange', () => {
  it('띠 전체와 데이터가 모두 들어가는 범위를 준다', () => {
    const result = toAxisRange(
      bands({ normalA: '100미만', normalB: '100-125', suspect: '126이상' }),
      { min: 88, max: 129 },
    )

    expect(result!.min).toBeLessThanOrEqual(88)
    expect(result!.max).toBeGreaterThanOrEqual(129)
  })

  it('띠가 없으면 자동 스케일에 맡긴다', () => {
    expect(toAxisRange([], { min: 0, max: 10 })).toBeUndefined()
  })

  it('정수로 떨어진다 — 축 라벨이 소수로 깨지지 않게', () => {
    const result = toAxisRange(bands({ normalA: '200미만', normalB: '', suspect: '' }), {
      min: 178,
      max: 246,
    })

    expect(Number.isInteger(result!.min)).toBe(true)
    expect(Number.isInteger(result!.max)).toBe(true)
  })
})

describe('toAxisRange 눈금', () => {
  it('축 경계가 눈금 단위로 떨어진다', () => {
    const result = toAxisRange(
      bands({ normalA: '100미만', normalB: '100-125', suspect: '126이상' }),
      { min: 88, max: 129 },
    )

    // 88~146 범위면 눈금 10 단위. 90/150 처럼 깔끔한 수여야 한다.
    expect(result!.min % 10).toBe(0)
    expect(result!.max % 10).toBe(0)
  })

  it('소수 값도 깨지지 않는다 (크레아티닌 1.15)', () => {
    const result = toAxisRange(
      bands({ normalA: '1.6이하', normalB: '', suspect: '1.6초과' }, { min: 0.9, max: 1.15 }),
      { min: 0.9, max: 1.15 },
    )

    expect(result!.min).toBeLessThanOrEqual(0.9)
    expect(result!.max).toBeGreaterThanOrEqual(1.15)
  })
})

describe('toAxisRange 눈금 나눔', () => {
  it('눈금 수가 범위를 정확히 나눈다 — 라벨이 소수로 깨지지 않게', () => {
    const result = toAxisRange(
      bands({ normalA: '100미만', normalB: '100-125', suspect: '126이상' }),
      { min: 88, max: 129 },
    )

    const step = (result!.max - result!.min) / result!.tickAmount
    expect(Number.isInteger(step)).toBe(true)
  })
})

describe('toBandLayout', () => {
  const axis = { min: 60, max: 150 }

  it('y축은 위가 큰 값이라 top을 max에서부터 잰다', () => {
    const layout = toBandLayout(
      [{ from: 126, to: 150, color: 'r', label: '질환의심', criterion: '126이상' }],
      axis,
    )

    // 126~150 은 위쪽 24/90 = 26.7%
    expect(layout[0].top).toBe(0)
    expect(layout[0].height).toBeCloseTo(26.7, 1)
  })

  it('아래쪽 띠는 top이 커진다', () => {
    const layout = toBandLayout(
      [{ from: 60, to: 100, color: 'g', label: '정상 A', criterion: '100미만' }],
      axis,
    )

    expect(layout[0].top).toBeCloseTo(55.6, 1)
    expect(layout[0].height).toBeCloseTo(44.4, 1)
  })

  it('축 밖으로 나간 부분은 잘라낸다', () => {
    const layout = toBandLayout(
      [{ from: 0, to: 200, color: 'x', label: '전체', criterion: '' }],
      axis,
    )

    expect(layout[0].top).toBe(0)
    expect(layout[0].height).toBe(100)
  })

  it('축과 겹치지 않는 띠는 버린다', () => {
    expect(
      toBandLayout([{ from: 200, to: 300, color: 'x', label: '밖', criterion: '' }], axis),
    ).toEqual([])
  })
})
