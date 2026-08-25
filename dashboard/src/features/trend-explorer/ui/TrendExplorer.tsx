import { FiChevronDown } from 'react-icons/fi'

import type { Measurement, MeasurementKey } from '@/entities/checkup'
import { JUDGEMENT_DISPLAY, type Judgement } from '@/entities/health-reference'
import { Card } from '@/shared/ui/Card'
import { useTrendExplorer } from '../model/useTrendExplorer'
import { TrendChart } from './TrendChart'

interface TrendExplorerProps {
  measurements: Measurement<Judgement>[]
}

/**
 * 항목을 골라 추이를 보는 행위.
 *
 * 선택은 `<select>`다 — 항목이 17개라 칩을 늘어놓으면 가로로 밀어야 한다.
 * 가로 스크롤은 잘린 항목을 없는 항목으로 만든다.
 */
export function TrendExplorer({ measurements }: TrendExplorerProps) {
  const { active, chart, options, selectedKey, setSelectedKey } = useTrendExplorer(measurements)

  if (!active || !chart) return null

  return (
    <Card className="p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">항목별 추이</h3>

        <div className="relative">
          <select
            value={selectedKey}
            onChange={(event) => setSelectedKey(event.target.value as MeasurementKey)}
            aria-label="추이를 볼 검사 항목"
            className="appearance-none rounded-lg border border-slate-300 bg-white py-1.5 pr-8 pl-3 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50"
          >
            {options.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.items.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                    {item.hasCriteria ? ` · ${JUDGEMENT_DISPLAY[item.judgement].label}` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <FiChevronDown
            className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-slate-500"
            aria-hidden="true"
          />
        </div>
      </div>

      <p className="tabular mb-1 text-sm text-slate-600">
        <span className="font-semibold text-slate-900">{active.label}</span>
        {active.unit && <span className="ml-1 text-slate-500">({active.unit})</span>}
      </p>

      <TrendChart active={active} points={chart.points} bands={chart.bands} axis={chart.axis} />
    </Card>
  )
}
