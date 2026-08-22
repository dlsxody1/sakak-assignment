import { Link } from '@tanstack/react-router'

import { useCheckupSource } from '../model/useCheckupSource'

/**
 * 페이지 머리글. 지금 보고 있는 데이터가 무엇인지 밝히고
 * 실 데이터로 가는 길을 연다.
 */
export function DashboardHeading() {
  const { subtitle, isSample } = useCheckupSource()

  return (
    <header className="mb-4 flex shrink-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          건강검진 결과
        </h1>
        <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
      </div>

      <Link to="/login" className="text-sm font-medium text-slate-700 underline underline-offset-4">
        {isSample ? '내 검진 결과 불러오기' : '다시 불러오기'}
      </Link>
    </header>
  )
}
