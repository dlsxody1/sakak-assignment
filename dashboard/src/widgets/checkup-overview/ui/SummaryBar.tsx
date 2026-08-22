import { JUDGEMENT_DISPLAY, type Judgement } from '@/entities/health-reference'

interface SummaryBarProps {
  distribution: { judgement: Judgement; count: number }[]
  total: number
}

/**
 * 최신 회차 판정 분포를 실제 비율 막대 한 줄로.
 *
 * 도넛 차트를 쓰지 않는다 — 각도보다 길이가 정확하게 비교되고,
 * 좁은 화면에서 가로 막대가 훨씬 잘 줄어든다.
 */
export function SummaryBar({ distribution, total }: SummaryBarProps) {
  return (
    <div>
      <div
        className="flex h-2.5 gap-0.5 overflow-hidden rounded-full"
        role="img"
        aria-label={distribution
          .map(({ judgement, count }) => `${JUDGEMENT_DISPLAY[judgement].label} ${count}개`)
          .join(', ')}
      >
        {distribution.map(({ judgement, count }) => (
          <div
            key={judgement}
            className={JUDGEMENT_DISPLAY[judgement].fill}
            style={{ width: `${(count / total) * 100}%` }}
          />
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {distribution.map(({ judgement, count }) => {
          const display = JUDGEMENT_DISPLAY[judgement]
          return (
            <li key={judgement} className="flex items-center gap-1.5 text-sm">
              <span className={`size-2 rounded-full ${display.fill}`} aria-hidden="true" />
              <span className="text-slate-600">{display.label}</span>
              <span className="tabular font-semibold text-slate-900">{count}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
