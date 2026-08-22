import { create } from 'zustand'

import type { Sex } from './types'

interface JudgementSexState {
  sex: Sex
  setSex: (sex: Sex) => void
}

/**
 * 판정에 쓸 성별.
 *
 * **사용자의 신원이 아니라 판정 기준이다.** `waist`·`hemoglobin`·`yGPT`는
 * 기준이 성별로 갈리는데(`남: 13-16.5 / 여: 12-15.5`) API 응답에 성별이 없어서
 * 화면에서 받아야 한다. 값이 없으면 판정이 조용히 틀린다.
 *
 * 서버에서 온 값이 아니라 사용자가 고른 값이고 판정·차트가 함께 쓰므로 zustand다.
 * 인증 폼이 이 값을 채우고, 대시보드는 무엇을 기준으로 봤는지 표시만 한다.
 *
 * 기본값이 `male`인 것은 예시 데이터를 인증 없이 열 수 있어야 해서다 —
 * 판정에는 항상 구체적인 값이 필요하다. 폼의 "아직 안 고름"은 폼이 따로 센다.
 */
export const useJudgementSex = create<JudgementSexState>((set) => ({
  sex: 'male',
  setSex: (sex) => set({ sex }),
}))
