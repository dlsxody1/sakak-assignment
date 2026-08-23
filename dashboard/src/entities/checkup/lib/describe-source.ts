import type { CheckupHistory } from '../model/types'

/**
 * 부제 문구. 데이터의 출처와 범위를 먼저 밝힌다.
 *
 * 예시 데이터일 때 `예시 데이터 ·`를 **앞에** 붙인다. 뒤에 배지로 달면
 * 훑을 때 안 읽히고, 예시를 실제처럼 보여주는 셈이 된다.
 */
export function describeSource(history: CheckupHistory, isSample: boolean): string {
  const dates = history.checkups.map((checkup) => checkup.date).filter(Boolean).sort()
  const years = dates.map((date) => date.slice(0, 4))
  const first = years.at(0)
  const last = years.at(-1)

  const range = first && last && first !== last ? ` (${first} – ${last})` : first ? ` (${first})` : ''
  const body = `국민건강보험공단 검진 기록 ${history.checkups.length}회차${range}`

  return isSample ? `예시 데이터 · ${body}` : body
}
