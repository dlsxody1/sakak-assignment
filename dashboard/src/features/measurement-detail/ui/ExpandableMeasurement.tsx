import { MeasurementDetail, MeasurementRow, type Measurement } from '@/entities/checkup'
import { JUDGEMENT_DISPLAY, JudgementBadge, type Judgement } from '@/entities/health-reference'
import { useDisclosure } from '../model/useDisclosure'

interface ExpandableMeasurementProps {
  measurement: Measurement<Judgement>
}

/**
 * 검사 항목을 펼쳐 판정 근거를 확인하는 행위.
 *
 * 펼침 상태는 이 피처가 갖고, 엔티티의 행·상세는 표현만 한다.
 */
export function ExpandableMeasurement({ measurement }: ExpandableMeasurementProps) {
  const { isOpen, toggle } = useDisclosure()

  return (
    <li className="border-b border-slate-100 last:border-0">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        className="w-full px-4 py-3 text-left transition-colors hover:bg-slate-50/80 sm:px-5"
      >
        <MeasurementRow
          measurement={measurement}
          sparkColor={JUDGEMENT_DISPLAY[measurement.judgement].chart}
          Badge={JudgementBadge}
          isOpen={isOpen}
        />
      </button>

      {isOpen && <MeasurementDetail measurement={measurement} Badge={JudgementBadge} />}
    </li>
  )
}
