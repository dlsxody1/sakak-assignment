import type { ComponentType } from 'react'

import type { Measurement } from '../model/measurement'

interface MeasurementDetailProps<TJudgement extends string> {
  measurement: Measurement<TJudgement>
  /** 판정 배지 컴포넌트. 판정 표현은 이 엔티티가 모른다. */
  Badge: ComponentType<{ judgement: TJudgement }>
}

const CRITERIA_ROWS = [
  ['normalA', '정상 A'],
  ['normalB', '정상 B'],
  ['suspect', '질환의심'],
] as const

/**
 * 판정 근거와 회차별 값. 왜 그 판정인지 사용자가 직접 확인할 수 있어야 한다.
 *
 * 2열 전환은 뷰포트가 아니라 **놓인 자리의 폭**으로 정한다(`@container`).
 * 넓은 화면이라도 검사 항목이 2열로 갈리면 이 패널은 좁은 열 안에 있어서,
 * 뷰포트 기준 `sm:`을 쓰면 기준과 값이 서로 겹친다.
 */
export function MeasurementDetail<TJudgement extends string>({
  measurement,
  Badge,
}: MeasurementDetailProps<TJudgement>) {
  return (
    <div className="@lg:grid-cols-2 @lg:px-5 grid gap-4 bg-slate-50/60 px-4 pt-1 pb-4">
      <div>
        <h4 className="text-xs font-semibold text-slate-500">판정 기준</h4>
        {measurement.hasCriteria ? (
          <dl className="mt-2 space-y-1">
            {CRITERIA_ROWS.map(([key, label]) => (
              <div key={key} className="flex gap-2 text-xs">
                <dt className="w-14 shrink-0 text-slate-500">{label}</dt>
                <dd className="tabular min-w-0 break-keep text-slate-700">
                  {measurement.criteria[key] || '—'}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-xs text-slate-500">
            검진 기관이 이 항목의 판정 기준을 제공하지 않습니다. 수치만 참고하세요.
          </p>
        )}
      </div>

      <div>
        <h4 className="text-xs font-semibold text-slate-500">회차별 값</h4>
        <ul className="mt-2 space-y-1">
          {[...measurement.series].reverse().map((point) => (
            <li key={point.date} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span className="tabular w-20 shrink-0 text-slate-500">{point.date}</span>
              <span className="tabular min-w-0 flex-1 font-medium text-slate-900">
                {point.value ?? <span className="font-normal text-slate-400">—</span>}
              </span>
              {measurement.hasCriteria && point.value && <Badge judgement={point.judgement} />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
