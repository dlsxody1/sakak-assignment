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
          {/* 스크롤은 lg 이상에서만 — 페이지 높이를 고정하는 것도 lg부터다.
              좁은 화면에서 overscroll-contain이 걸리면 이 카드 위의 터치가
              페이지로 전달되지 않아 스크롤이 멈춘다. */}
          <div className="min-h-0 flex-1 lg:overflow-y-auto lg:overscroll-contain">
            <VisitList days={overview.visitDays} />
          </div>
        </Card>
      </div>

      <MeasurementGroups measurements={overview.measurements} />
    </div>
  )
}

/**
 * 로딩 자리표시자.
 *
 * 격자 클래스가 위 본문과 **글자 그대로 같다.** 스켈레톤이 1열인데 결과가 2열이면
 * 데이터가 도착하는 순간 화면 전체가 재배치되고, 그 점프가 로딩보다 더 거슬린다.
 * 오른쪽 검사 항목 패널은 화면의 절반이라 자리를 비워둘 수 없다.
 */
function OverviewSkeleton() {
  return (
    <div
      role="status"
      aria-label="검진 결과를 불러오는 중"
      className="grid min-h-0 grid-cols-[minmax(0,1fr)] gap-4 lg:h-full lg:grid-cols-[minmax(0,5fr)_minmax(0,4fr)]"
    >
      <div className="flex min-h-0 flex-col gap-4">
        <Card className="p-4">
          <Bar className="h-5 w-40" />
          <Bar className="mt-4 h-2.5 rounded-full" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2, 3].map((index) => (
              <Bar key={index} className="h-4 w-20" tone="light" />
            ))}
          </div>
          <div className="mt-4 border-t border-slate-100 pt-3">
            <Bar className="h-4 w-28" />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[0, 1, 2, 3, 4].map((index) => (
                <Bar key={index} className="h-7 w-28 rounded-md" tone="light" />
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <Bar className="h-4 w-20" />
            <Bar className="h-8 w-40 rounded-lg" tone="light" />
          </div>
          <Bar className="h-44" tone="light" />
        </Card>

        <Card className="flex min-h-0 flex-col p-4">
          <Bar className="h-4 w-16" />
          <div className="mt-2.5 space-y-2">
            {[0, 1, 2].map((index) => (
              <Bar key={index} className="h-5" tone="light" />
            ))}
          </div>
        </Card>
      </div>

      <Card className="flex min-h-0 flex-col overflow-hidden">
        <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">
          <Bar className="h-4 w-20" />
        </div>
        <div className="min-h-0 flex-1 space-y-4 p-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1 space-y-1.5">
                <Bar className="h-3 w-16" tone="light" />
                <Bar className="h-4 w-24" />
              </div>
              <Bar className="h-5 w-16 rounded-md" tone="light" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

/** 자리표시자 막대. `tone`은 위계 — 값이 들어올 자리가 라벨보다 진하다. */
function Bar({ className = '', tone = 'base' }: { className?: string; tone?: 'base' | 'light' }) {
  const shade = tone === 'base' ? 'bg-slate-200' : 'bg-slate-100'
  return <div aria-hidden="true" className={`animate-pulse rounded ${shade} ${className}`} />
}
