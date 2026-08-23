import { Link } from '@tanstack/react-router'

import { useCheckupSource } from '../model/useCheckupSource'

/**
 * 페이지 머리글. 지금 보고 있는 데이터가 무엇인지 밝히고
 * 실 데이터로 가는 길을 연다.
 *
 * 예시 데이터일 때 조회는 이 화면의 **주된 행동**이라 주재 버튼으로 둔다 —
 * 카드와 차트가 채운 화면에서 밑줄 링크는 눈에 걸리지 않는다.
 * 실 데이터를 이미 본 뒤의 `다시 불러오기`는 주된 행동이 아니라 약하게 둔다.
 */
export function DashboardHeading() {
  const { subtitle, isSample } = useCheckupSource()

  return (
    <header className="mb-4 flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div>
        <h1 className="text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
          건강검진 결과
        </h1>
        <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
      </div>

      {isSample ? (
        <Link
          to="/login"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          건강검진 조회
        </Link>
      ) : (
        <Link
          to="/login"
          className="text-sm font-medium text-slate-700 underline underline-offset-4"
        >
          다시 불러오기
        </Link>
      )}
    </header>
  )
}
