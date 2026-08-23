import Chart from 'react-apexcharts'

import type { Measurement } from '@/entities/checkup'
import { JUDGEMENT_DISPLAY, type Judgement } from '@/entities/health-reference'
import type { Band } from '../lib/bands'
import { toBandLayout } from '../lib/bands'
import { usePlotArea } from '../model/usePlotArea'

interface TrendChartProps {
  active: Measurement<Judgement>
  points: { date: string; value: number | null }[]
  bands: Band[]
  axis?: { min: number; max: number; tickAmount: number }
}

/**
 * 6회차 추이. 배경의 기준 띠 위로 데이터 선이 지나간다.
 *
 * 띠를 ApexCharts `annotations`로 그리지 않는다 — DOM 순서상 시리즈보다 뒤에 와서
 * 선을 덮어버린다. 절대 배치한 배경 레이어로 깔고 차트를 그 위에 투명하게 얹는다.
 * 그 레이어의 좌표는 그려진 플롯 영역을 재서 쓴다 — 축 폭이 라벨 자릿수에 따라
 * 달라져서 상수로 박으면 축 라벨을 덮는다.
 */
export function TrendChart({ active, points, bands, axis }: TrendChartProps) {
  const color = JUDGEMENT_DISPLAY[active.judgement].chart
  const hasGap = points.some((point) => point.value === null)
  const layout = axis ? toBandLayout(bands, axis) : []
  const { containerRef, plot } = usePlotArea(active.key)

  return (
    <div>
      {/*
        ApexCharts는 컨테이너 폭을 재서 SVG 크기를 정하는데, 폭 제약이 없으면
        내용에 맞춰 커지고 그리드 트랙까지 같이 늘어난다. min-w-0으로 잘라둔다.
      */}
      <div ref={containerRef} className="relative min-w-0">
        <div
          className="pointer-events-none absolute"
          style={{
            left: plot?.left ?? 0,
            top: plot?.top ?? 0,
            width: plot?.width ?? 0,
            height: plot?.height ?? 0,
            visibility: plot ? 'visible' : 'hidden',
          }}
          aria-hidden="true"
        >
          {layout.map((band) => (
            <div
              key={band.label}
              className="absolute inset-x-0"
              style={{
                top: `${band.top}%`,
                height: `${band.height}%`,
                backgroundColor: band.color,
              }}
            />
          ))}
        </div>

        <Chart
          type="line"
          height={200}
          width="100%"
          series={[{ name: active.label, data: points.map((point) => point.value) }]}
          options={{
            chart: {
              toolbar: { show: false },
              zoom: { enabled: false },
              fontFamily: 'inherit',
              animations: { enabled: false },
              parentHeightOffset: 0,
              background: 'transparent',
            },
            colors: [color],
            stroke: { width: 2.5, curve: 'straight' },
            markers: { size: 5, strokeWidth: 2, strokeColors: '#fff', hover: { size: 7 } },
            dataLabels: { enabled: false },
            grid: {
              show: false,
              padding: { left: 0, right: 0, top: 0, bottom: 0 },
            },
            xaxis: {
              categories: points.map((point) => point.date.slice(0, 4)),
              axisBorder: { show: false },
              axisTicks: { show: false },
              tooltip: { enabled: false },
              labels: { style: { colors: '#64748b', fontSize: '11px' } },
            },
            yaxis: {
              min: axis?.min,
              max: axis?.max,
              tickAmount: axis?.tickAmount,
              labels: {
                style: { colors: '#64748b', fontSize: '11px' },
                // 기본값은 라벨 오른쪽 끝을 플롯 왼쪽 경계에 붙인다. 그 자리를 기준 띠와
                // 첫 회차 마커가 차지해서 마지막 글자가 가려진다 (`171.5` → `171.`).
                offsetX: -6,
                formatter: (value) => (Number.isInteger(value) ? String(value) : value.toFixed(1)),
              },
            },
            tooltip: {
              x: { formatter: (_, opts) => points[opts?.dataPointIndex ?? -1]?.date ?? '' },
              y: { formatter: (value) => `${value}${active.unit ? ` ${active.unit}` : ''}` },
            },
            noData: { text: '표시할 데이터가 없습니다' },
          }}
        />
      </div>

      {bands.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
          {bands.map((band) => (
            <li key={band.label} className="flex items-center gap-1.5">
              <span
                className="size-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: band.color }}
                aria-hidden="true"
              />
              <span className="text-slate-600">{band.label}</span>
              <span className="tabular text-slate-500">{band.criterion}</span>
            </li>
          ))}
        </ul>
      )}

      {hasGap && <p className="mt-1.5 text-xs text-slate-500">선이 끊긴 구간은 미측정입니다.</p>}
    </div>
  )
}
