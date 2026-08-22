import { useAuthWaiting } from '../model/useAuthWaiting'

/**
 * 인증 대기 화면.
 *
 * 카운트다운 숫자는 `aria-hidden`이다 — 매초 바뀌는 노드를 라이브 리전에 두면
 * 4분 30초 동안 270번 낭독되고 그 사이 다른 건 아무것도 들리지 않는다.
 * 대신 아래 `role="status"` 노드가 30초(마지막 1분은 10초) 간격으로만 갱신된다.
 */
export function AuthWaiting() {
  const {
    remaining,
    total,
    label,
    announcement,
    isUrgent,
    isExpired,
    isSubmitting,
    confirm,
    cancel,
  } = useAuthWaiting()

  if (isExpired) {
    return (
      <div className="space-y-4">
        <p role="alert" tabIndex={-1} className="rounded-lg bg-suspect-soft px-3 py-2 text-sm text-suspect">
          인증 시간 4분 30초가 지났습니다. 입력한 내용은 그대로 두었으니 다시 요청해 주세요.
        </p>
        <button
          type="button"
          onClick={cancel}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          폼으로 돌아가기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 tabIndex={-1} className="text-base font-semibold text-slate-900">
        토스 앱에서 인증해 주세요
      </h2>

      <p className="text-sm text-slate-600">
        토스 앱에 인증 요청을 보냈습니다. 앱에서 인증을 마친 뒤 아래 버튼을 눌러 주세요.
      </p>

      <div>
        <p className="flex items-baseline justify-between text-sm">
          <span className="text-slate-500">남은 시간</span>
          <span
            aria-hidden="true"
            className={`tabular ${isUrgent ? 'font-bold text-suspect' : 'font-medium text-slate-900'}`}
          >
            {label}
          </span>
        </p>
        {/* 남은 비율을 그린다. 차오르는 막대는 "진행 중"으로 읽혀 뜻이 반대가 된다. */}
        <div aria-hidden="true" className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full ${isUrgent ? 'bg-suspect' : 'bg-slate-900'}`}
            style={{ width: `${(remaining / total) * 100}%` }}
          />
        </div>
        {isUrgent && (
          <p className="mt-2 text-xs font-medium text-suspect">
            1분 안에 인증하지 않으면 처음부터 다시 해야 합니다.
          </p>
        )}
      </div>

      <span role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>

      <div className="space-y-2">
        <button
          type="button"
          onClick={confirm}
          disabled={isSubmitting}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:bg-slate-400"
        >
          {isSubmitting ? '결과를 불러오는 중…' : '인증을 완료했습니다'}
        </button>
        <button
          type="button"
          onClick={cancel}
          disabled={isSubmitting}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700"
        >
          취소
        </button>
      </div>
    </div>
  )
}
