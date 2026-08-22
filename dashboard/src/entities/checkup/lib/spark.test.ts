import { describe, expect, it } from 'vitest'

import { toNumber, toSparkPoints } from './spark'

describe('toNumber', () => {
  it('혈압은 수축기를 쓴다', () => {
    expect(toNumber('142/88')).toBe(142)
  })

  it('결측은 null', () => {
    expect(toNumber(null)).toBeNull()
    expect(toNumber('')).toBeNull()
  })

  it('숫자가 아닌 값은 null — 0으로 읽지 않는다', () => {
    expect(toNumber('정상')).toBeNull()
    expect(toNumber('음성')).toBeNull()
  })
})

describe('toSparkPoints', () => {
  it('결측 회차는 건너뛰되 가로 간격은 유지한다', () => {
    // 2번째가 빠지면 x는 0, 66.7, 100 으로 벌어진다.
    const points = toSparkPoints(['10', null, '20', '30'])
    expect(points).toHaveLength(3)
    expect(points[0].x).toBe(0)
    expect(points[1].x).toBeCloseTo(66.67, 1)
    expect(points[2].x).toBe(100)
  })

  it('최댓값이 위로 간다 (y축 반전)', () => {
    const points = toSparkPoints(['10', '20'])
    expect(points[0].y).toBe(100)
    expect(points[1].y).toBe(0)
  })

  it('값이 전부 같으면 평평한 선 — 0으로 나누지 않는다', () => {
    const points = toSparkPoints(['5', '5', '5'])
    expect(points.every((p) => p.y === 50)).toBe(true)
  })

  it('측정값이 1개 이하면 선을 그리지 않는다', () => {
    expect(toSparkPoints(['10', null, null])).toEqual([])
    expect(toSparkPoints([null, null])).toEqual([])
  })

  it('숫자가 아닌 값만 있으면 빈 배열', () => {
    expect(toSparkPoints(['정상', '정상'])).toEqual([])
  })
})
