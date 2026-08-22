import { useQuery } from '@tanstack/react-query'

import { checkupKeys, fetchCheckupHistory } from '../api/fetch-checkup'

/** 검진 이력을 읽는다. 서버 상태의 단일 출처는 Query 캐시다. */
export function useCheckupHistory() {
  return useQuery({
    queryKey: checkupKeys.history(),
    queryFn: fetchCheckupHistory,
  })
}
