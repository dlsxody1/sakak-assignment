import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  // 높이 고정은 대시보드의 규칙이라 여기 두지 않는다 —
  // 인증 폼은 세로로 길어서 잘리면 안 된다.
  component: () => (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      <Outlet />
    </div>
  ),
})
