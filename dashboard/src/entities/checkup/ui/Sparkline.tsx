import type { SparkPoint } from '../lib/spark'

interface SparklineProps {
  points: SparkPoint[]
  color: string
}

/** 6회차 추이 미리보기. 값이 2개 미만이면 아무것도 그리지 않는다. */
export function Sparkline({ points, color }: SparklineProps) {
  if (points.length < 2) return null

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const last = points.at(-1)!

  return (
    <svg
      viewBox="-4 -8 108 116"
      preserveAspectRatio="none"
      className="h-7 w-12 shrink-0"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        opacity={0.5}
      />
      <circle cx={last.x} cy={last.y} r={7} fill={color} />
    </svg>
  )
}
