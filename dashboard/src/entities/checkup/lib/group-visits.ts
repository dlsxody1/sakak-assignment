import type { CheckupVisit } from '../model/types'

export interface VisitDay {
  date: string
  /** 그 날 받은 검진 종류 (`일반`·`구강`). 정규화에서 순서가 고정된다. */
  types: string[]
  organizationName: string
}

/**
 * 방문 이력을 날짜별로 묶는다. 한 날짜에 일반·구강이 함께 오므로
 * 목록에서는 날짜 한 줄에 종류를 나열하는 편이 읽힌다.
 *
 * 입력 순서(최신순)를 유지한다.
 */
export function groupVisitsByDate(visits: CheckupVisit[]): VisitDay[] {
  const days = new Map<string, VisitDay>()

  for (const visit of visits) {
    const day = days.get(visit.date)
    if (day) day.types.push(visit.type)
    else
      days.set(visit.date, {
        date: visit.date,
        types: [visit.type],
        organizationName: visit.organizationName,
      })
  }

  return [...days.values()]
}
