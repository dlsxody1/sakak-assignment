import { FiChevronDown } from 'react-icons/fi'

import type { Measurement } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'
import { useDisclosure } from '../model/useDisclosure'
import { ExpandableMeasurement } from './ExpandableMeasurement'

interface MeasurementGroupSectionProps {
  label: string
  items: Measurement<Judgement>[]
  suspectCount: number
  /** 처음에 펼쳐둘지. 주의가 필요한 묶음만 열어둔다. */
  defaultOpen: boolean
}

/** 검사 묶음 하나를 접었다 편다. 접혀 있어도 질환의심 수는 보인다. */
export function MeasurementGroupSection({
  label,
  items,
  suspectCount,
  defaultOpen,
}: MeasurementGroupSectionProps) {
  const { isOpen, toggle } = useDisclosure(defaultOpen)

  return (
    <section className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
      >
        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        <span className="tabular text-xs text-slate-400">{items.length}</span>
        {suspectCount > 0 && (
          <span className="tabular rounded bg-suspect-soft px-1.5 py-0.5 text-xs font-semibold text-suspect">
            질환의심 {suspectCount}
          </span>
        )}
        <FiChevronDown
          className={`ml-auto size-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <ul>
          {items.map((item) => (
            <ExpandableMeasurement key={item.key} measurement={item} />
          ))}
        </ul>
      )}
    </section>
  )
}
