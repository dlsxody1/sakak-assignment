import { useQuery } from '@tanstack/react-query'

import { checkupKeys, fetchCheckupHistory } from '../api/fetch-checkup'

/**
 * 검진 이력을 읽는다. 서버 상태의 단일 출처는 Query 캐시다.
 *
 * **예시 데이터를 다시 채우지 않는다.** `queryFn`은 인증 없이 화면을 보여주기 위한
 * fixture라, 기본값(`staleTime: 0`)이면 인증으로 받은 실 데이터를 마운트·포커스마다
 * 예시로 덮어쓴다. fixture는 캐시가 빌 때 **한 번만** 채우는 초기값이고,
 * 실 데이터가 들어온 뒤에는 그걸 유지하는 것이 곧 폴백이다.
 */
export function useCheckupHistory() {
  return useQuery({
    queryKey: checkupKeys.history(),
    queryFn: fetchCheckupHistory,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
}
