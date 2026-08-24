import { Link } from '@tanstack/react-router'
import { FiArrowLeft } from 'react-icons/fi'

import { CheckupInquiry } from '@/features/checkup-inquiry'
import { Card } from '@/shared/ui/Card'

/**
 * 인증 화면. 선택지가 하나뿐이라 한 열이고 폭을 넓히지 않는다.
 *
 * 대시보드와 달리 높이를 고정하지 않는다 — 폼이 세로로 길고,
 * 좁은 화면에서 잘리면 안 된다.
 *
 * 돌아가는 길은 **머리글 위**에 둔다. 인증은 벽이 아니라 옵트인이라
 * 나가는 문이 늘 보여야 하는데, 폼 아래에 두면 세로로 긴 폼을 다 지나야
 * 발견된다 — 안 보이는 출구는 없는 출구다.
 */
export function AuthPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Link
        to="/"
        className="mb-4 -ml-1 inline-flex w-fit items-center gap-1 rounded-md px-1 py-1 text-sm text-slate-600 transition-colors hover:text-slate-900"
      >
        <FiArrowLeft aria-hidden="true" className="size-4" />
        대시보드로 돌아가기
      </Link>

      <h1 className="text-lg font-semibold text-slate-900">내 검진 결과 불러오기</h1>
      <p className="mt-1 text-sm text-slate-600">
        국민건강보험공단 기록을 조회합니다. 간편인증 앱 인증이 필요합니다.
      </p>

      <Card className="mt-5 p-5">
        <CheckupInquiry />
      </Card>
    </main>
  )
}
