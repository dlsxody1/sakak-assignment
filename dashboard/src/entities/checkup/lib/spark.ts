/**
 * 검진값을 숫자로 읽는다. `142/88`(혈압)은 수축기를, `1.2/1.0`(시력)은 앞값을 쓴다.
 * 숫자가 아니면 null — 추이를 그릴 수 없는 값이다.
 */
export function toNumber(value: string | null): number | null {
  if (!value) return null
  const head = value.split('/')[0].trim()
  const n = Number(head)
  return Number.isFinite(n) ? n : null
}

export interface SparkPoint {
  x: number
  y: number
}

/**
 * 시계열을 0-100 좌표로 정규화한다. 결측은 건너뛴 채 인덱스는 유지해서
 * 2021·2023처럼 빠진 회차가 가로축에서 실제 간격으로 벌어진다.
 *
 * 값이 전부 같으면(변화 없음) 중앙에 평평한 선을 그린다 — 0으로 나누지 않는다.
 */
export function toSparkPoints(values: (string | null)[]): SparkPoint[] {
  const numbers = values.map(toNumber)
  const measured = numbers.filter((n): n is number => n !== null)
  if (measured.length < 2) return []

  const min = Math.min(...measured)
  const max = Math.max(...measured)
  const span = max - min
  const lastIndex = values.length - 1

  return numbers.flatMap((n, index) =>
    n === null ? [] : [{ x: (index / lastIndex) * 100, y: span === 0 ? 50 : 100 - ((n - min) / span) * 100 }],
  )
}
