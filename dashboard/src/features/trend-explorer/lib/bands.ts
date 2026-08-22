/**
 * 기준 문자열에서 수치 경계를 뽑는다. 차트 배경에 구간 띠를 깔기 위한 것이고,
 * 판정에는 쓰지 않는다 — 판정은 `entities/health-reference`의 몫이다.
 *
 * 성별 분기·혈압 복합처럼 한 축으로 못 그리는 기준은 빈 배열을 준다.
 * 띠가 없어도 선은 그려지므로 화면이 깨지지 않는다.
 */
export interface Band {
  from: number
  to: number
  color: string
  label: string
  /** 범례에 보여줄 기준 원문 (`100미만`). 띠 위에 얹으면 선과 겹쳐서 밖으로 뺀다. */
  criterion: string
}

const COMPARISON = /^(-?[\d.]+)\s*(미만|이하|이상|초과)$/
const RANGE = /^([\d.]+)\s*[-~]\s*([\d.]+)$/

/** 한 기준 문자열이 덮는 수치 구간. 해석 못 하면 null. */
function toRange(criterion: string): { from: number; to: number } | null {
  const trimmed = criterion.trim()
  if (!trimmed) return null

  // 성별 분기·복합 조건은 단일 축에 못 그린다.
  if (/[남여]/.test(trimmed) || trimmed.includes('이며') || trimmed.includes('또는')) return null

  const range = RANGE.exec(trimmed)
  if (range) return { from: Number(range[1]), to: Number(range[2]) }

  const comparison = COMPARISON.exec(trimmed)
  if (!comparison) return null

  const value = Number(comparison[1])
  if (!Number.isFinite(value)) return null

  return comparison[2] === '미만' || comparison[2] === '이하'
    ? { from: Number.NEGATIVE_INFINITY, to: value }
    : { from: value, to: Number.POSITIVE_INFINITY }
}

/**
 * 띠와 데이터가 모두 들어가는 y축 범위.
 *
 * 축이 띠보다 넓으면 위아래에 빈 여백이 생겨 띠가 차트를 채우지 못한다.
 * 띠가 없으면 `undefined`를 줘서 ApexCharts의 자동 스케일에 맡긴다.
 */
export function toAxisRange(
  bands: Band[],
  bounds: { min: number; max: number },
): { min: number; max: number; tickAmount: number } | undefined {
  if (bands.length === 0) return undefined

  const min = Math.min(...bands.map((band) => band.from), bounds.min)
  const max = Math.max(...bands.map((band) => band.to), bounds.max)

  // 눈금이 깔끔한 수로 떨어지게 자릿수에 맞춰 반올림한다.
  // 그냥 여백만 주면 축 라벨이 `130.8` 같은 소수로 깨진다.
  const span = max - min || 1
  const step = 10 ** Math.floor(Math.log10(span / 4))

  const from = Math.floor(min / step) * step
  // 최소 3칸은 있어야 축이 축처럼 보인다. 0칸이면 아래 루프가 끝나지 않는다.
  let steps = Math.max(3, Math.round((max - from) / step))

  // 눈금 수가 구간 수를 나눠떨어뜨려야 라벨이 `127.5`처럼 깨지지 않는다.
  // 나뉘는 눈금 수가 없으면 위쪽을 한 칸 늘려서 맞춘다 — 라벨을 포기하지 않는다.
  const divisor = (n: number) => [5, 4, 6, 3].find((tick) => n % tick === 0)
  while (!divisor(steps)) steps += 1

  return { min: from, max: from + steps * step, tickAmount: divisor(steps)! }
}

export interface BandLayout {
  label: string
  color: string
  /** 플롯 영역 위에서부터의 위치 (%) */
  top: number
  height: number
}

/**
 * 띠를 축 범위 안의 백분율 위치로 바꾼다.
 *
 * ApexCharts `annotations`가 데이터 선을 덮어버리므로 띠는 차트 뒤 배경 레이어에
 * 직접 그린다. 그 레이어가 쓸 좌표를 여기서 계산한다.
 *
 * y축은 위가 큰 값이라 `top`은 `max`에서부터 잰다.
 */
export function toBandLayout(
  bands: Band[],
  axis: { min: number; max: number },
): BandLayout[] {
  const span = axis.max - axis.min
  if (span <= 0) return []

  return bands.flatMap((band) => {
    const from = Math.max(band.from, axis.min)
    const to = Math.min(band.to, axis.max)
    if (from >= to) return []

    return [
      {
        label: band.label,
        color: band.color,
        top: ((axis.max - to) / span) * 100,
        height: ((to - from) / span) * 100,
      },
    ]
  })
}

/** 이 기준을 단일 축 차트에 띠로 그릴 수 있는가. */
export function hasDrawableBands(criteria: {
  normalA: string
  normalB: string
  suspect: string
}): boolean {
  return [criteria.normalA, criteria.normalB, criteria.suspect].some(
    (criterion) => toRange(criterion) !== null,
  )
}

/**
 * 차트에 깔 구간 띠. 무한대는 데이터 범위에 맞춰 잘라낸다.
 */
export function toBands(
  criteria: { normalA: string; normalB: string; suspect: string },
  colors: { normalA: string; normalB: string; suspect: string },
  labels: { normalA: string; normalB: string; suspect: string },
  bounds: { min: number; max: number },
): Band[] {
  // 여유를 둬서 띠가 차트 끝까지 닿게 한다.
  const pad = (bounds.max - bounds.min || 1) * 0.5
  const floor = bounds.min - pad
  const ceiling = bounds.max + pad

  return (['normalA', 'normalB', 'suspect'] as const).flatMap((key) => {
    const range = toRange(criteria[key])
    if (!range) return []

    const from = Math.max(range.from, floor)
    const to = Math.min(range.to, ceiling)
    if (from >= to) return []

    return [{ from, to, color: colors[key], label: labels[key], criterion: criteria[key].trim() }]
  })
}
