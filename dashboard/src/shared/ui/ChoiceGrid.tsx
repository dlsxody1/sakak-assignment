import { useState, type KeyboardEvent } from 'react'
import { FiCheck } from 'react-icons/fi'

interface Choice {
  value: string
  label: string
  /** 로고 파일명. `<basePath>/<slug>.svg`를 찾는다. */
  slug: string
  /** 로고 파일이 없을 때 쓸 배경색. */
  color: string
  /** 로고 파일이 없을 때 배경 위에 얹을 짧은 글자. */
  mark: string
  /** 그 배경 위에서 흰 글자가 읽히는지. 노란 계열은 false여야 대비가 선다. */
  onDark: boolean
}

interface ChoiceGridProps {
  choices: readonly Choice[]
  value: string
  /** 로고를 찾을 경로. `/auth` 면 `/auth/toss.svg`. */
  basePath: string
  label: string
  disabled?: boolean
  invalid?: boolean
  describedBy?: string
  /** DOM 선택 이벤트. `<input type="radio">`의 자리를 대신한다. */
  onSelect: (value: string) => void
}

/**
 * 로고 타일 중 하나를 고르는 그리드. 라디오 그룹의 시각적 대체물이다.
 *
 * 접힌 `<select>`와 달리 선택지를 펼쳐 보여준다 — 브랜드는 이름보다 로고로 먼저
 * 인지되고, 접어두면 자기 것이 거기 있는지 열기 전에는 알 수 없다.
 *
 * 열은 3개다(400px 미만은 2개). 4열로 넓히면 타일이 좁아져 긴 라벨이 접히는데,
 * 한국어는 단어 경계가 없어 브라우저가 뜻과 무관한 자리에서 끊는다 —
 * `NH모바일인증서`가 `인증/서`가 됐다. 열을 늘리기 전에 가장 긴 라벨이
 * 타일 안쪽 폭에 들어가는지 실제 화면에서 재 본다.
 *
 * 선택 표시는 색만으로 하지 않는다 — 테두리와 체크 아이콘을 함께 쓴다(적록색맹).
 * 로고 파일이 없으면 브랜드색 배경 + 짧은 글자로 폴백한다. 파일을 나중에 떨구면
 * 코드 수정 없이 로고로 바뀐다.
 *
 * `useState`는 이미지 로드 실패 집합뿐이다 — 순수 DOM 상태라 `ui`에 둔다.
 */
export function ChoiceGrid({
  choices,
  value,
  basePath,
  label,
  disabled = false,
  invalid = false,
  describedBy,
  onSelect,
}: ChoiceGridProps) {
  const [failed, setFailed] = useState<string[]>([])

  /**
   * 화살표로 항목 사이를 옮긴다. `role="radio"`는 네이티브 라디오와 달리
   * 이 동작을 주지 않아서 직접 붙인다 — 없으면 탭으로 그룹에 들어온 뒤
   * 첫 항목 말고는 고를 수가 없다.
   */
  const moveFocus = (event: KeyboardEvent<HTMLDivElement>) => {
    const KEYS = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']
    if (!KEYS.includes(event.key)) return
    event.preventDefault()

    const current = choices.findIndex((choice) => choice.value === value)
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1
    // 아직 아무것도 안 골랐으면 첫 항목부터 — 끝에서는 반대편으로 감는다.
    const next = current === -1 ? 0 : (current + step + choices.length) % choices.length

    onSelect(choices[next].value)
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      aria-invalid={invalid}
      aria-describedby={describedBy}
      onKeyDown={moveFocus}
      className={`grid grid-cols-2 gap-2 min-[400px]:grid-cols-3 ${invalid ? 'rounded-lg ring-1 ring-suspect' : ''}`}
    >
      {choices.map((choice, index) => {
        const isSelected = value === choice.value
        const hasLogo = !failed.includes(choice.slug)

        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={disabled}
            // 라디오 그룹은 탭 순서에서 한 정거장이다 — 선택된 것(없으면 첫 번째)만 받는다.
            tabIndex={isSelected || (value === '' && index === 0) ? 0 : -1}
            onClick={() => onSelect(choice.value)}
            className={`flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs transition-colors disabled:opacity-50 ${
              isSelected
                ? 'border-normal-a bg-normal-a-soft font-medium text-slate-900'
                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="relative">
              {hasLogo ? (
                <img
                  src={`${basePath}/${choice.slug}.svg`}
                  alt=""
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-md object-contain"
                  onError={() => setFailed((current) => [...current, choice.slug])}
                />
              ) : (
                <span
                  aria-hidden="true"
                  style={{ backgroundColor: choice.color }}
                  className={`flex h-7 w-7 items-center justify-center rounded-md text-[0.625rem] font-bold ${
                    choice.onDark ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {choice.mark}
                </span>
              )}
              {isSelected && (
                <FiCheck
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 rounded-full bg-normal-a p-0.5 text-white"
                />
              )}
            </span>
            {/*
              한국어는 단어 경계가 없어 기본값이면 아무 데서나 끊는다 —
              `NH모바일인증서`가 `인증/서`로 쪼개졌다. `break-keep`이 어절 단위로만 끊는다.
            */}
            <span className="text-center leading-tight break-keep">{choice.label}</span>
          </button>
        )
      })}
    </div>
  )
}
