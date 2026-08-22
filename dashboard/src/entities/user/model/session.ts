import { create } from 'zustand'

import type { Sex } from './types'

interface SessionState {
  sex: Sex
  setSex: (sex: Sex) => void
}

/**
 * 사용자 세션. 지금은 성별 하나뿐이다.
 *
 * 서버에서 온 값이 아니라 사용자가 고른 값이라 zustand에 둔다 —
 * API 응답에 성별이 없어서 화면에서 받아야 하고, 판정·차트가 함께 쓴다.
 *
 * 로그인이 붙으면 로그인 폼이 이 값을 채운다. 소비하는 쪽은 바뀌지 않는다.
 */
export const useSession = create<SessionState>((set) => ({
  sex: 'male',
  setSex: (sex) => set({ sex }),
}))
