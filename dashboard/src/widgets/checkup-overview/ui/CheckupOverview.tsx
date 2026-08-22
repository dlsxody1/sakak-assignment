import { VisitList } from '@/entities/checkup'
import { TrendExplorer } from '@/features/trend-explorer'
import { Card } from '@/shared/ui/Card'
import { useCheckupOverview } from '../model/useCheckupOverview'
import { MeasurementGroups } from './MeasurementGroups'
import { OverviewHeader } from './OverviewHeader'

/**
 * 검진 결과 화면. 엔티티와 피처를 조립하기만 한다.
 *
 * 넓은 화면에서는 페이지가 스크롤하지 않는다 — 요약·추이·이력은 항상 보이고
 * 넘치는 것은 검사 항목 목록 안에서만 스크롤한다. 대시보드는 훑는 화면이라
 * 전체가 스크롤되면 훑기가 성립하지 않는다.
 */
export function CheckupOverview() {
  const { overview, isPending, isError, error } = useCheckupOverview()

  if (isPending) return <OverviewSkeleton />

  if (isError || !overview) {
    return (
      <Card className="p-6">
        <h2 className="text-base font-semibold text-slate-900">검진 결과를 불러오지 못했습니다</h2>
        <p className="mt-1.5 text-sm text-slate-600">
          {error instanceof Error ? error.message : '잠시 후 다시 시도해 주세요.'}
        </p>
      </Card>
    )
  }

  return (
    <div className="grid min-h-0 grid-cols-[minmax(0,1fr)] gap-4 lg:h-full lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]">
      <div className="flex min-h-0 flex-col gap-4">
        <OverviewHeader overview={overview} />
        <TrendExplorer measurements={overview.measurements} />
        <Card className="flex min-h-0 flex-col overflow-hidden p-4">
          <h3 className="mb-2.5 shrink-0 text-sm font-semibold text-slate-900">검진 이력</h3>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <VisitList days={overview.visitDays} />
          </div>
        </Card>
      </div>

      <MeasurementGroups measurements={overview.measurements} />
    </div>
  )
}

function OverviewSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="검진 결과를 불러오는 중">
      <Card className="p-4 sm:p-6">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-5 h-2.5 animate-pulse rounded-full bg-slate-200" />
        <div className="mt-4 flex gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-4 w-20 animate-pulse rounded bg-slate-100" />
          ))}
        </div>
      </Card>
      <Card className="p-4">
        <div className="h-50 animate-pulse rounded bg-slate-100" />
      </Card>
    </div>
  )
}
