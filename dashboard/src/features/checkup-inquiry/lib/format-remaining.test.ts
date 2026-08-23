import { describe, expect, it } from 'vitest'

import { formatRemaining, isAnnounceTick } from './format-remaining'

describe('formatRemaining', () => {
  it('4분 30초 — 인증 제한 시간 그대로', () => {
    expect(formatRemaining(270_000)).toBe('4분 30초')
  })

  it('초가 0이면 분만 말한다 — "4분 0초"는 군더더기다', () => {
    expect(formatRemaining(240_000)).toBe('4분')
  })

  it('60초 미만은 분을 떼고 초만 — "0분 45초"는 0이 먼저 걸린다', () => {
    expect(formatRemaining(45_000)).toBe('45초')
  })

  it('올림한다 — 남은 0.4초를 0초로 보여주면 아직 있는 시간이 없어 보인다', () => {
    expect(formatRemaining(400)).toBe('1초')
  })

  it('음수는 0초 — 마감이 지나도 표기가 깨지지 않는다', () => {
    expect(formatRemaining(-5_000)).toBe('0초')
  })
})

describe('isAnnounceTick', () => {
  it('1분 넘게 남았으면 30초 간격으로만 읽는다', () => {
    expect(isAnnounceTick(270_000)).toBe(true) // 4분 30초
    expect(isAnnounceTick(240_000)).toBe(true) // 4분
    expect(isAnnounceTick(269_000)).toBe(false) // 4분 29초
  })

  it('마지막 1분은 10초 간격 — 급한 게 실제 정보다', () => {
    expect(isAnnounceTick(60_000)).toBe(true)
    expect(isAnnounceTick(30_000)).toBe(true)
    expect(isAnnounceTick(25_000)).toBe(false)
  })

  it('0이면 읽지 않는다 — 시간 초과는 별도 안내가 말한다', () => {
    expect(isAnnounceTick(0)).toBe(false)
    expect(isAnnounceTick(-1_000)).toBe(false)
  })
})
