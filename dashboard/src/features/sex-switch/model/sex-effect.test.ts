import { describe, expect, it } from 'vitest'

import { judge } from '@/entities/health-reference'

// 성별 전환이 실제로 판정을 바꾸는지 도메인 수준에서 고정한다.
// fixture의 2025 값들은 우연히 남녀 판정이 같아서 화면만 봐서는 확인되지 않는다.
const HEMOGLOBIN = {
  normalA: '남: 13-16.5 / 여: 12-15.5',
  normalB: '남: 12-12.9 / 여: 10-11.9',
  suspect: '남:12.0미만 / 여:10.0미만',
}
const WAIST = { normalA: '', normalB: '', suspect: '남 90이상 / 여 85이상' }

describe('성별이 판정을 가른다', () => {
  it('혈색소 12.5 — 남 정상B, 여 정상A', () => {
    expect(judge(HEMOGLOBIN, '12.5', 'male')).toBe('normalB')
    expect(judge(HEMOGLOBIN, '12.5', 'female')).toBe('normalA')
  })

  it('혈색소 15.8 — 남 정상A, 여는 상한을 넘어 판정불가', () => {
    expect(judge(HEMOGLOBIN, '15.8', 'male')).toBe('normalA')
    expect(judge(HEMOGLOBIN, '15.8', 'female')).toBe('undetermined')
  })

  it('허리둘레 87 — 남은 기준 미달로 판정불가, 여는 질환의심', () => {
    expect(judge(WAIST, '87', 'male')).toBe('undetermined')
    expect(judge(WAIST, '87', 'female')).toBe('suspect')
  })

  it('감마지티피 84는 남녀 모두 질환의심 — 전환해도 안 바뀌는 게 정상이다', () => {
    const yGPT = { normalA: '남:11-63 / 여:8-35', normalB: '남:64-77 / 여:36-45', suspect: '남:78이상 / 여:46이상' }
    expect(judge(yGPT, '84', 'male')).toBe('suspect')
    expect(judge(yGPT, '84', 'female')).toBe('suspect')
  })
})
