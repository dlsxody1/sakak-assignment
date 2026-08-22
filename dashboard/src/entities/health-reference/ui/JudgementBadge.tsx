import type { Judgement } from '../model/types'
import { JUDGEMENT_DISPLAY } from './judgement-display'

interface JudgementBadgeProps {
  judgement: Judgement
  /** 형태 기호를 숨긴다. 이미 같은 줄에 형태가 보이는 곳에서만 쓴다. */
  hideShape?: boolean
}

/**
 * 판정 배지. 색·라벨·형태 세 채널로 같은 것을 말한다.
 *
 * 색만 다르고 형태가 같으면 색을 못 보는 사용자에게는 전부 같은 배지다.
 */
export function JudgementBadge({ judgement, hideShape = false }: JudgementBadgeProps) {
  const display = JUDGEMENT_DISPLAY[judgement]

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap ${display.badge}`}
    >
      {!hideShape && <span aria-hidden="true">{display.shape}</span>}
      {display.label}
    </span>
  )
}
