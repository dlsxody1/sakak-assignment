/**
 * 남은 시간 표기. 콜론(`4:30`)을 쓰지 않는다 —
 * `-`·`N/A`를 안 쓰는 이유와 같다(카피 규칙: 기호 대신 말).
 *
 * 60초 미만은 분을 떼고 초만 말한다. `0분 45초`는 0이 눈에 먼저 걸린다.
 */
export function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  if (total < 60) return `${total}초`

  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  return seconds === 0 ? `${minutes}분` : `${minutes}분 ${seconds}초`
}

/**
 * 스크린리더에 읽어줄 시각인지 판단한다.
 *
 * 매초 낭독하면 4분 30초 동안 270번 말하고 그 사이 다른 건 아무것도 못 듣는다.
 * 30초 간격으로만 읽되, 마지막 1분은 급한 게 실제 정보라 10초 간격으로 좁힌다.
 */
export function isAnnounceTick(ms: number): boolean {
  const total = Math.ceil(ms / 1000)
  if (total <= 0) return false
  return total <= 60 ? total % 10 === 0 : total % 30 === 0
}
