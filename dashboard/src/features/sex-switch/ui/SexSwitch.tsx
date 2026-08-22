import { SEX_LABELS, useSession, type Sex } from '@/entities/user'

const OPTIONS: Sex[] = ['male', 'female']

/**
 * 성별 전환.
 *
 * API 응답에 성별이 없는데 허리둘레·혈색소·감마지티피는 성별로 기준이 갈린다.
 * 로그인이 붙기 전까지 사용자가 직접 고른다 — 잘못된 기준으로 조용히 판정하느니
 * 무엇을 기준으로 봤는지 드러내는 편이 맞다.
 */
export function SexSwitch() {
  const sex = useSession((state) => state.sex)
  const setSex = useSession((state) => state.setSex)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500">판정 기준</span>
      <div className="flex rounded-lg bg-slate-100 p-0.5" role="group" aria-label="판정에 쓸 성별">
        {OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setSex(option)}
            aria-pressed={sex === option}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              sex === option
                ? 'bg-white text-slate-900 shadow-[0_1px_2px_rgb(15_23_42/0.06)]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {SEX_LABELS[option]}
          </button>
        ))}
      </div>
    </div>
  )
}
