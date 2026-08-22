import { describeSource, useCheckupHistory } from '@/entities/checkup'

/**
 * 대시보드 머리글이 쓸 출처 문구.
 *
 * 같은 Query 캐시를 읽으므로 요청이 늘지 않는다 — 캐시가 단일 출처다.
 */
export function useCheckupSource() {
  const { data } = useCheckupHistory()

  return {
    subtitle: data ? describeSource(data, data.isSample) : '',
    isSample: data?.isSample ?? true,
  }
}
