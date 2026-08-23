import fixture from '@/shared/api/__fixtures__/checkup-response.json'
import { normalizeCheckupResponse } from '../lib/normalize'
import type { CheckupHistory, CheckupResponse } from '../model/types'

export const checkupKeys = {
  all: ['checkup'] as const,
  history: () => [...checkupKeys.all, 'history'] as const,
}

/**
 * 개발·데모용 검진 이력.
 *
 * 실 API는 2단계 인증을 거쳐야 응답이 나오고(`features/checkup-inquiry`),
 * 인증 없이 화면을 볼 수 있어야 하므로 fixture를 같은 정규화 경로로 흘린다.
 */
export function fetchCheckupHistory(): CheckupHistory {
  return normalizeCheckupResponse(fixture as CheckupResponse, true)
}
