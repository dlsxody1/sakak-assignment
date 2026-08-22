import type { VisitDay } from '../lib/group-visits'

interface VisitListProps {
  days: VisitDay[]
}

/**
 * 검진 방문 이력. 날짜 한 줄에 그날 받은 검진 종류를 나열한다.
 *
 * 참조 정보라 가장 낮은 위계다 — 작게 조판해 요약·추이가 자리를 갖게 한다.
 */
export function VisitList({ days }: VisitListProps) {
  return (
    <ul className="space-y-1.5">
      {days.map((day) => (
        <li key={day.date} className="flex items-baseline gap-2 text-xs">
          <span className="tabular w-22 shrink-0 font-medium text-slate-700">{day.date}</span>
          <span className="flex shrink-0 gap-1">
            {day.types.map((type) => (
              <span key={type} className="rounded bg-slate-100 px-1.5 text-slate-600">
                {type}
              </span>
            ))}
          </span>
          <span className="min-w-0 flex-1 truncate text-slate-500">{day.organizationName}</span>
        </li>
      ))}
    </ul>
  )
}
