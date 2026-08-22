import type { QueryClient } from '@tanstack/react-query'
import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <div className="min-h-dvh bg-slate-50 text-slate-900 lg:h-dvh lg:overflow-hidden">
      <Outlet />
    </div>
  ),
})
