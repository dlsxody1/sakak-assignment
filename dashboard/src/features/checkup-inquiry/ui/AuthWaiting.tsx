import { josa } from '@/shared/lib/josa'
import { Button } from '@/shared/ui/Button'
import { useAuthWaiting } from '../model/useAuthWaiting'

/**
 * 인증 대기 화면.
 *
 * 카운트다운 숫자는 `aria-hidden`이다 — 매초 바뀌는 노드를 라이브 리전에 두면
 * 제한 시간 내내 매초 낭독되고 그 사이 다른 건 아무것도 들리지 않는다.
 * 대신 아래 `role="status"` 노드가 30초(마지막 1분은 10초) 간격으로만 갱신된다.
 */
export function AuthWaiting() {
  const {
    remaining,
    total,
    totalLabel,
    label,
    authApp,
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
          {/*
            제한 시간은 상수에서 만든다 — 문장에 박으면 상수만 바뀌었을 때 화면이 거짓말한다.
            조사도 값에서 정한다: `5분`은 "이", `4분 30초`는 "가"다.
          */}
          인증 시간 {totalLabel}
          {josa(totalLabel, '이', '가')} 지났습니다. 입력한 내용은 그대로 두었으니 다시 요청해
          주세요.
        </p>
        <Button type="button" onClick={cancel}>
          폼으로 돌아가기
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 tabIndex={-1} className="text-base font-semibold text-slate-900">
        {authApp} 앱에서 인증해 주세요
      </h2>

      <p className="text-sm text-slate-600">
        {authApp} 앱에 인증 요청을 보냈습니다. 앱에서 인증을 마친 뒤 아래 버튼을 눌러 주세요.
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
        <Button type="button" onClick={confirm} isLoading={isSubmitting}>
          {isSubmitting ? '결과를 불러오는 중…' : '인증을 완료했습니다'}
        </Button>
        <Button type="button" variant="ghost" onClick={cancel} disabled={isSubmitting}>
          취소
        </Button>
      </div>
    </div>
  )
}
