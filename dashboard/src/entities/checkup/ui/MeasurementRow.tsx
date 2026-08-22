import type { ComponentType } from 'react'
import { FiChevronDown } from 'react-icons/fi'

import type { Measurement } from '../model/measurement'
import { toSparkPoints } from '../lib/spark'
import { Sparkline } from './Sparkline'

interface MeasurementRowProps<TJudgement extends string> {
  measurement: Measurement<TJudgement>
  /** 추이 선 색. 판정 색 체계는 `health-reference`가 갖는다. */
  sparkColor: string
  /**
   * 판정 배지 컴포넌트. 이 엔티티는 판정 표현을 모르므로 타입만 받아 직접 그린다.
   * 만들어진 엘리먼트를 내려받으면 부모가 이 행의 내부 구조를 알아야 한다.
   */
  Badge: ComponentType<{ judgement: TJudgement }>
  /** 펼침 상태. 화살표 방향이 여기 따라간다. */
  isOpen?: boolean
}

/**
 * 검사 항목 한 줄의 내용 — 이름·값·단위·추이·판정.
 *
 * 표현만 한다. 클릭·펼침 같은 행위는 이 행을 감싸는 feature가 갖는다.
 */
export function MeasurementRow<TJudgement extends string>({
  measurement,
  sparkColor,
  Badge,
  isOpen,
}: MeasurementRowProps<TJudgement>) {
  const points = toSparkPoints(measurement.series.map((point) => point.value))

  return (
    <span className="flex w-full items-center gap-3">
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-slate-900">
          {measurement.label}
        </span>
        <span className="tabular mt-0.5 block text-base font-semibold text-slate-900">
          {measurement.value ?? <span className="font-normal text-slate-400">측정 안 함</span>}
          {measurement.value && measurement.unit && (
            <span className="ml-1 text-xs font-normal text-slate-500">{measurement.unit}</span>
          )}
        </span>
      </span>

      <Sparkline points={points} color={sparkColor} />

      {measurement.hasCriteria ? (
        <Badge judgement={measurement.judgement} />
      ) : (
        <span className="shrink-0 text-xs whitespace-nowrap text-slate-400">기준 없음</span>
      )}

      {isOpen !== undefined && (
        <FiChevronDown
          className={`size-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      )}
    </span>
  )
}
