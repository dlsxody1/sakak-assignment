import { CheckupOverview, DashboardHeading } from '@/widgets/checkup-overview'

/**
 * 넓은 화면에서 페이지 높이를 화면에 맞춘다 — 대시보드는 훑는 화면이라
 * 전체가 스크롤되면 훑기가 성립하지 않는다. 좁은 화면은 세로 스크롤이
 * 자연스러운 환경이라 높이를 고정하지 않는다.
 */
export function DashboardPage() {
  return (
    <div className="mx-auto flex max-w-6xl flex-col px-4 py-4 sm:px-6 lg:h-dvh lg:overflow-hidden lg:py-6">
      <DashboardHeading />

      <div className="min-h-0 flex-1">
        <CheckupOverview />
      </div>
    </div>
  )
}
