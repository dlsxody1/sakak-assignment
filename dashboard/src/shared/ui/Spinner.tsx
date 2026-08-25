/**
 * 진행 중 표시.
 *
 * 이건 아이콘이 아니라 애니메이션이라 `react-icons`를 쓰지 않는다 — `react-icons`의
 * 스피너는 정지 그림이고, 회전은 어차피 우리가 CSS로 붙여야 한다. 원 두 개짜리
 * `<svg>` 하나가 그 자체로 최종 형태다.
 *
 * `aria-hidden`인 것은 이 조각이 단독으로 쓰이지 않기 때문이다. 호출부가 버튼 라벨을
 * `인증 요청 중…`처럼 바꾸고 `aria-busy`를 걸므로, 스크린 리더에는 이미 상태가 전달된다.
 * 여기에 라벨을 또 달면 같은 말이 두 번 읽힌다.
 *
 * `prefers-reduced-motion`에서 회전이 멈추는 것은 전역 CSS가 처리한다 —
 * 그때는 정지한 원호가 남아 자리와 뜻은 유지된다.
 */
export function Spinner({ className = '' }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className={`size-4 shrink-0 animate-spin ${className}`}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
