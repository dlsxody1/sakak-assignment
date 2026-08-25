import { Link } from '@tanstack/react-router'
import { FiAlertCircle } from 'react-icons/fi'

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
    <div className="mb-4 shrink-0">
      {isSample && <SampleNotice />}

      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
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
    </div>
  )
}

/**
 * 예시 데이터 고지. 부제의 `예시 데이터 ·`만으로는 약하다 —
 * 회색 소문자 한 줄은 카드와 차트에 묻혀서, 훑는 사람은 실제 결과로 읽는다.
 * 화면 맨 위에서 본문 폭 전체를 가로지르게 두어 먼저 걸리게 한다.
 *
 * 판정 5색을 쓰지 않는다. 그 색들은 건강 상태의 뜻을 이미 갖고 있어서
 * 여기에 쓰면 "예시"가 "주의"나 "정상"으로 읽힌다.
 */
function SampleNotice() {
  return (
    <p className="mb-3 flex items-start gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700">
      <FiAlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-slate-500" />
      <span>
        <strong className="font-semibold text-slate-900">예시 데이터입니다.</strong> 실제 검진 기록이
        아닙니다. 본인 결과를 보려면 <strong className="font-semibold">건강검진 조회</strong> 버튼을
        눌러 주세요.
      </span>
    </p>
  )
}
