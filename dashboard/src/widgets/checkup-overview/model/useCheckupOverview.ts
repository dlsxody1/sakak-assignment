import { useMemo } from 'react'

import { groupVisitsByDate, useCheckupHistory } from '@/entities/checkup'
import { JUDGEMENT_ORDER } from '@/entities/health-reference'
import { useJudgementSex } from '@/entities/user'
import { buildMeasurements } from '../lib/build-measurements'
import { countByJudgement, countUndetermined, selectAttention } from '../lib/summarize'
import type { CheckupOverview } from './types'

/**
 * 화면이 쓸 데이터를 모은다. 계산은 전부 `lib/`의 순수 함수가 하고
 * 이 훅은 서버 상태와 그것들을 잇기만 한다.
 */
export function useCheckupOverview() {
  const query = useCheckupHistory()
  // 성별은 사용자가 고른 값이다. API가 주지 않아서 인증 폼에서 받는다.
  const sex = useJudgementSex((state) => state.sex)

  const overview = useMemo<CheckupOverview | undefined>(() => {
    if (!query.data) return undefined

    const history = query.data
    const measurements = buildMeasurements(history, sex)
    const latest = history.checkups.at(-1)

    return {
      patientName: history.patientName,
      latestDate: latest?.date ?? '',
      sex,
      evaluation: latest?.evaluation ?? '',
      measurements,
      distribution: countByJudgement(measurements, JUDGEMENT_ORDER),
      attention: selectAttention(measurements),
      undeterminedCount: countUndetermined(measurements),
      visitDays: groupVisitsByDate(history.visits),
    }
  }, [query.data, sex])

  return { ...query, overview }
}
