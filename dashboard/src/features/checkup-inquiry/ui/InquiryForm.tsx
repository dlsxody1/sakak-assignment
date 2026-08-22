import { SEX_LABELS, type Sex } from '@/entities/user'
import { useInquiryForm } from '../model/useInquiryForm'
import { TELECOMS } from '../model/types'

const SEXES: Sex[] = ['male', 'female']

const FIELD = 'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400'
const LABEL = 'block text-sm font-medium text-slate-700'
const ERROR = 'mt-1 text-xs text-suspect'

/**
 * 인증 폼.
 *
 * 상태와 제출은 전부 `useInquiryForm`이 갖는다 — props가 없고 콜백도 안 받는다.
 * 에러 문구 노드는 항상 DOM에 두고 내용만 채운다.
 * 생겼다 사라지면 `aria-describedby` 참조가 끊긴다.
 */
export function InquiryForm() {
  const { form, errors, setField, sex, setSex, submit, isSubmitting, error } = useInquiryForm()

  return (
    <form onSubmit={submit} aria-busy={isSubmitting} className="space-y-4">
      {error && (
        <p role="alert" tabIndex={-1} className="rounded-lg bg-suspect-soft px-3 py-2 text-sm text-suspect">
          {error}
        </p>
      )}

      <div>
        <label htmlFor="legalName" className={LABEL}>
          이름
        </label>
        <input
          id="legalName"
          className={`${FIELD} mt-1`}
          autoComplete="name"
          value={form.legalName}
          onChange={(event) => setField('legalName', event.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.legalName)}
          aria-describedby="legalName-error"
        />
        <p id="legalName-error" className={ERROR}>
          {errors.legalName}
        </p>
      </div>

      <div>
        <label htmlFor="birthdate" className={LABEL}>
          생년월일
        </label>
        <input
          id="birthdate"
          className={`${FIELD} tabular mt-1`}
          inputMode="numeric"
          maxLength={8}
          placeholder="19900101"
          autoComplete="bday"
          value={form.birthdate}
          onChange={(event) => setField('birthdate', event.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.birthdate)}
          aria-describedby="birthdate-error"
        />
        <p id="birthdate-error" className={ERROR}>
          {errors.birthdate}
        </p>
      </div>

      <div>
        <label htmlFor="phoneNo" className={LABEL}>
          휴대폰 번호
        </label>
        <input
          id="phoneNo"
          type="tel"
          className={`${FIELD} tabular mt-1`}
          inputMode="numeric"
          maxLength={11}
          placeholder="01012345678"
          autoComplete="tel"
          value={form.phoneNo}
          onChange={(event) => setField('phoneNo', event.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.phoneNo)}
          aria-describedby="phoneNo-error"
        />
        <p id="phoneNo-error" className={ERROR}>
          {errors.phoneNo}
        </p>
      </div>

      <div>
        <label htmlFor="telecom" className={LABEL}>
          통신사
        </label>
        <select
          id="telecom"
          className={`${FIELD} mt-1 bg-white`}
          value={form.telecom}
          onChange={(event) => setField('telecom', event.target.value)}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.telecom)}
          aria-describedby="telecom-error"
        >
          <option value="">선택</option>
          {TELECOMS.map((telecom) => (
            <option key={telecom.value} value={telecom.value}>
              {telecom.label}
            </option>
          ))}
        </select>
        <p id="telecom-error" className={ERROR}>
          {errors.telecom}
        </p>
      </div>

      <fieldset disabled={isSubmitting}>
        <legend className={LABEL}>판정 기준</legend>
        <div className="mt-1 flex gap-4" aria-describedby="sex-help sex-error">
          {SEXES.map((option) => (
            <label key={option} className="flex items-center gap-1.5 text-sm text-slate-700">
              <input
                type="radio"
                name="sex"
                value={option}
                checked={sex === option}
                onChange={() => setSex(option)}
              />
              {SEX_LABELS[option]}
            </label>
          ))}
        </div>
        <p id="sex-help" className="mt-1 text-xs text-slate-500">
          허리둘레·혈색소·감마지티피는 판정 기준이 성별로 다릅니다.
        </p>
        <p id="sex-error" className={ERROR}>
          {errors.sex}
        </p>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:bg-slate-400"
      >
        {isSubmitting ? '인증 요청 중…' : '인증 요청'}
      </button>

      <p className="text-xs text-slate-500">입력한 정보는 조회에만 쓰이고 저장하지 않습니다.</p>
    </form>
  )
}
