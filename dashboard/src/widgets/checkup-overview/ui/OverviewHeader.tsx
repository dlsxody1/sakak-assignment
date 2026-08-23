import { JudgementBadge } from '@/entities/health-reference'
import { SEX_LABELS } from '@/entities/user'
import { Card } from '@/shared/ui/Card'
import type { CheckupOverview } from '../model/types'
import { SummaryBar } from './SummaryBar'

interface OverviewHeaderProps {
  overview: CheckupOverview
}

/** 최신 회차 상태 요약. 첫 화면에서 "지금 뭘 봐야 하나"에 답한다. */
export function OverviewHeader({ overview }: OverviewHeaderProps) {
  const { attention, distribution, latestDate, evaluation, undeterminedCount, sex } = overview
  const judged = distribution.reduce((sum, entry) => sum + entry.count, 0)

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-base font-semibold text-slate-900">최근 검진 결과</h2>
          <p className="tabular text-sm text-slate-500">
            {latestDate}
            {evaluation && <span className="ml-2 text-slate-400">종합판정 {evaluation}</span>}
          </p>
        </div>
        {/* 컨트롤은 인증 폼으로 옮겼다. 무엇을 기준으로 판정했는지는 남아야 한다. */}
        <p className="text-xs text-slate-500">
          판정 기준 <span className="font-medium text-slate-700">{SEX_LABELS[sex]}</span>
        </p>
      </div>

      <div className="mt-3">
        <SummaryBar distribution={distribution} total={judged} />
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3">
        {attention.length > 0 ? (
          <>
            <h3 className="text-sm font-semibold text-slate-900">
              주의가 필요한 항목
              <span className="tabular ml-1.5 font-normal text-slate-500">{attention.length}</span>
            </h3>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {attention.map((item) => (
                <li
                  key={item.key}
                  className="flex items-center gap-1.5 rounded-md bg-suspect-soft px-2 py-1"
                >
                  <span className="text-sm font-medium text-slate-900">{item.label}</span>
                  <span className="tabular text-sm font-semibold text-suspect">{item.value}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-slate-600">질환의심 항목이 없습니다.</p>
        )}
      </div>

      {undeterminedCount > 0 && (
        <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <JudgementBadge judgement="undetermined" />
          <span className="tabular">{undeterminedCount}개</span>
          항목이 어느 기준 구간에도 걸리지 않았습니다. 정상이라는 뜻이 아닙니다.
        </p>
      )}
    </Card>
  )
}
