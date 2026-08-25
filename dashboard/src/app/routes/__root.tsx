import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

import { NotFoundPage, RouteErrorPage } from '@/pages/error'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // 높이 고정은 대시보드의 규칙이라 여기 두지 않는다 —
  // 인증 폼은 세로로 길어서 잘리면 안 된다.
  component: () => (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <Outlet />
    </div>
  ),
  // 루트에 달면 모든 라우트가 상속한다. 라우트마다 달면 새 라우트를
  // 추가한 사람이 잊는 순간 그 화면만 조용히 흰 화면으로 돌아간다.
  notFoundComponent: NotFoundPage,
  errorComponent: RouteErrorPage,
})
