import { Link } from '@tanstack/react-router'

import { CheckupInquiry } from '@/features/checkup-inquiry'
import { Card } from '@/shared/ui/Card'

/**
 * 인증 화면. 선택지가 하나뿐이라 한 열이고 폭을 넓히지 않는다.
 *
 * 대시보드와 달리 높이를 고정하지 않는다 — 폼이 세로로 길고,
 * 좁은 화면에서 잘리면 안 된다.
 */
export function AuthPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-lg font-semibold text-slate-900">내 검진 결과 불러오기</h1>
      <p className="mt-1 text-sm text-slate-600">
        국민건강보험공단 기록을 조회합니다. 토스 앱 인증이 필요합니다.
      </p>

      <Card className="mt-5 p-5">
        <CheckupInquiry />
      </Card>

      <Link to="/" className="mt-5 text-sm text-slate-500 underline underline-offset-4">
        예시 데이터로 돌아가기
      </Link>
    </main>
  )
}
