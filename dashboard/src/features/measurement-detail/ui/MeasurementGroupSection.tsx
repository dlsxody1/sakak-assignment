import type { Measurement } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'
import { ExpandableMeasurement } from './ExpandableMeasurement'

interface MeasurementGroupSectionProps {
  label: string
  items: Measurement<Judgement>[]
  suspectCount: number
}

/**
 * 검사 묶음 하나. 묶음은 접지 않는다 — 머리글은 구분자일 뿐이다.
 *
 * 접기를 뺀 이유: 묶음 7개를 접으면 머리글이 항목 21줄 자리를 차지하면서
 * 정작 값은 몇 줄만 보이고 화면 아래가 빈다. 2열에서 21개가 다 들어가므로
 * 접어서 아낄 공간이 애초에 없다.
 */
export function MeasurementGroupSection({
  label,
  items,
  suspectCount,
}: MeasurementGroupSectionProps) {
  return (
    <section className="border-b border-slate-100 last:border-0">
      <div className="flex items-center gap-2 bg-slate-50/60 px-4 py-1.5">
        <h3 className="text-xs font-semibold tracking-wide text-slate-500">{label}</h3>
        <span className="tabular text-xs text-slate-400">{items.length}</span>
        {suspectCount > 0 && (
          <span className="tabular rounded bg-suspect-soft px-1.5 py-0.5 text-xs font-semibold text-suspect">
            질환의심 {suspectCount}
          </span>
        )}
      </div>

      <ul>
        {items.map((item) => (
          <ExpandableMeasurement key={item.key} measurement={item} />
        ))}
      </ul>
    </section>
  )
}
