import { create } from 'zustand'

import type { InquiryStage } from './types'

/**
 * CANDiY 인증 제한. 넘기면 1차부터 다시다.
 *
 * NHIS `checkup`의 문서상 제한은 **300초**다. 270초는 HIRA(`medical_record`)의
 * 간편인증 제한이라 이 엔드포인트의 값이 아니다 — probe 주석의 "4분 30초"를
 * 따라가다 30초를 실제보다 짧게 잡고 있었다.
 *
 * 화면 문구는 이 값에서 `formatRemaining`으로 만든다. 숫자를 문장에 박아 두면
 * 여기만 고쳤을 때 화면이 다른 시간을 말한다.
 */
export const AUTH_WINDOW_MS = 300_000

interface InquiryState {
  stage: InquiryStage
  /** 1차 바디. 2차가 그대로 다시 보내야 해서 들고 있는다. */
  body: object | null
  /** 1차 응답의 `.data` 통째. 일부만 골라 넣으면 2차가 실패한다. */
  multiFactorInfo: unknown
  /** 인증 마감 시각(epoch ms). 남은 시간은 여기서 계산한다. */
  deadline: number
  error: string
  startWaiting: (body: object, multiFactorInfo: unknown) => void
  fail: (error: string) => void
  finish: () => void
  reset: () => void
}

/**
 * 인증 플로우 단계.
 *
 * 서버에서 온 값이 아니라 화면의 흐름이라 zustand다.
 * **검진 결과는 여기 없다** — 서버 상태의 단일 출처는 Query 캐시다.
 *
 * 남은 초가 아니라 **마감 시각**을 든다. 남은 초를 스토어에 두면 1초마다
 * 구독자 전체가 리렌더되고, 탭이 백그라운드로 가서 타이머가 늦게 돌면
 * 실제보다 시간이 남은 것처럼 보인다.
 */
export const useInquiry = create<InquiryState>((set) => ({
  stage: 'idle',
  body: null,
  multiFactorInfo: null,
  deadline: 0,
  error: '',
  startWaiting: (body, multiFactorInfo) =>
    set({
      stage: 'waiting',
      body,
      multiFactorInfo,
      deadline: Date.now() + AUTH_WINDOW_MS,
      error: '',
    }),
  // 실패해도 입력값은 폼이 들고 있다. 여기서 지우지 않는다.
  fail: (error) => set({ stage: 'idle', body: null, multiFactorInfo: null, deadline: 0, error }),
  finish: () => set({ stage: 'done', body: null, multiFactorInfo: null, deadline: 0, error: '' }),
  reset: () => set({ stage: 'idle', body: null, multiFactorInfo: null, deadline: 0, error: '' }),
}))
