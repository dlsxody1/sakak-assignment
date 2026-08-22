import { useMemo, useState } from 'react'

import {
  MEASUREMENT_GROUPS,
  toNumber,
  type Measurement,
  type MeasurementKey,
} from '@/entities/checkup'
import { JUDGEMENT_DISPLAY, type Judgement } from '@/entities/health-reference'
import { hasDrawableBands, toAxisRange, toBands } from '../lib/bands'

const BAND_COLORS = {
  normalA: 'var(--color-normal-a-soft)',
  normalB: 'var(--color-normal-b-soft)',
  suspect: 'var(--color-suspect-soft)',
}

const BAND_LABELS = {
  normalA: JUDGEMENT_DISPLAY.normalA.label,
  normalB: JUDGEMENT_DISPLAY.normalB.label,
  suspect: JUDGEMENT_DISPLAY.suspect.label,
}

/** 추이를 그리려면 숫자로 읽히는 값이 2회차 이상 있어야 한다. */
const isChartable = (measurement: Measurement<Judgement>) =>
  measurement.series.filter((point) => toNumber(point.value) !== null).length >= 2

/**
 * 어떤 항목의 추이를 볼지 고르는 행위.
 *
 * 기본값은 질환의심이면서 기준 띠를 그릴 수 있는 항목 — 볼 이유가 가장 큰 것.
 */
export function useTrendExplorer(measurements: Measurement<Judgement>[]) {
  const chartable = useMemo(() => measurements.filter(isChartable), [measurements])
  const [selectedKey, setSelectedKey] = useState<MeasurementKey | null>(null)

  const active =
    chartable.find((m) => m.key === selectedKey) ??
    chartable.find((m) => m.judgement === 'suspect' && hasDrawableBands(m.criteria)) ??
    chartable.find((m) => m.judgement === 'suspect') ??
    chartable[0]

  const chart = useMemo(() => {
    if (!active) return undefined

    const points = active.series.map((point) => ({
      date: point.date,
      value: toNumber(point.value),
    }))
    const measured = points.map((p) => p.value).filter((v): v is number => v !== null)

    const bounds = { min: Math.min(...measured), max: Math.max(...measured) }
    const bands = toBands(active.criteria, BAND_COLORS, BAND_LABELS, bounds)

    return { points, bands, axis: toAxisRange(bands, bounds) }
  }, [active])

  /** 묶음별로 나눈 선택지. `<optgroup>`이 그대로 쓴다. */
  const options = useMemo(
    () =>
      MEASUREMENT_GROUPS.map((group) => ({
        label: group.label,
        items: group.keys.flatMap((key) => chartable.filter((m) => m.key === key)),
      })).filter((group) => group.items.length > 0),
    [chartable],
  )

  return { active, chart, options, selectedKey: selectedKey ?? active?.key, setSelectedKey }
}
