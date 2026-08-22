import type { Measurement } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'
import { MeasurementGroupSection } from '@/features/measurement-detail'
import { Card } from '@/shared/ui/Card'
import { groupMeasurements } from '../lib/group-measurements'

interface MeasurementGroupsProps {
  measurements: Measurement<Judgement>[]
}

/**
 * 검사 항목 21개 전량. 넓은 화면에서는 이 목록 안에서만 스크롤한다 —
 * 요약과 추이는 항상 보여야 하기 때문이다.
 *
 * 주의가 필요한 묶음만 펼쳐둔다. 접는 것이지 잘라내는 게 아니라
 * 모든 항목에 여전히 닿을 수 있다.
 */
export function MeasurementGroups({ measurements }: MeasurementGroupsProps) {
  const groups = groupMeasurements(measurements)

  return (
    <Card className="flex min-h-0 flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">
        <h2 className="text-sm font-semibold text-slate-900">
          검사 항목
          <span className="tabular ml-1.5 font-normal text-slate-500">{measurements.length}</span>
        </h2>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {groups.map((group) => (
          <MeasurementGroupSection
            key={group.label}
            label={group.label}
            items={group.items}
            suspectCount={group.suspectCount}
            defaultOpen={group.suspectCount > 0}
          />
        ))}
      </div>
    </Card>
  )
}
