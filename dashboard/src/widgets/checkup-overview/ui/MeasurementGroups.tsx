import type { Measurement } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'
import { MeasurementGroupSection } from '@/features/measurement-detail'
import { Card } from '@/shared/ui/Card'
import { groupMeasurements } from '../lib/group-measurements'
import { splitColumns } from '../lib/split-columns'

interface MeasurementGroupsProps {
  measurements: Measurement<Judgement>[]
}

/**
 * 검사 항목 21개 전량. 넓은 화면(lg)에서는 이 목록 안에서만 스크롤한다 —
 * 요약과 추이는 항상 보여야 하기 때문이다. 좁은 화면에서는 페이지가 통째로
 * 스크롤되므로 여기서 스크롤을 잡지 않는다. `overscroll-contain`이 남아 있으면
 * 이 영역 위의 터치가 페이지로 전달되지 않아 스크롤이 멈춘다.
 *
 * 넓은 화면(xl)에서는 2열로 나눠 21개가 스크롤 없이 들어가게 한다. CSS `columns`가
 * 아니라 flex 2열인 이유: 높이가 제한된 스크롤 컨테이너에서 `columns`는 내용이
 * 넘치면 열을 가로로 계속 만들어 가로 스크롤을 낳는다. 열을 우리가 세면 안 그런다.
 *
 * 묶음은 접지 않는다 — 21개가 다 들어가는데 접으면 머리글만 남고 값이 사라진다.
 */
export function MeasurementGroups({ measurements }: MeasurementGroupsProps) {
  const groups = groupMeasurements(measurements)
  const [leftColumn, rightColumn] = splitColumns(groups)

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-900">
          검사 항목
          <span className="tabular ml-1.5 font-normal text-slate-500">{measurements.length}</span>
        </h2>
      </div>

      <div className="min-h-0 flex-1 lg:overflow-x-hidden lg:overflow-y-auto lg:overscroll-contain xl:flex xl:items-start">
        <div className="min-w-0 xl:flex-1 xl:border-r xl:border-slate-100">
          {leftColumn.map((group) => (
            <MeasurementGroupSection
              key={group.label}
              label={group.label}
              items={group.items}
              suspectCount={group.suspectCount}
            />
          ))}
        </div>
        <div className="min-w-0 xl:flex-1">
          {rightColumn.map((group) => (
            <MeasurementGroupSection
              key={group.label}
              label={group.label}
              items={group.items}
              suspectCount={group.suspectCount}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
