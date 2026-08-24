import { SEX_LABELS, type Sex } from '@/entities/user'
import { Button } from '@/shared/ui/Button'
import { ChoiceGrid } from '@/shared/ui/ChoiceGrid'
import { describedBy } from '@/shared/lib/aria'
import { Field } from '@/shared/ui/Field'
import { Input } from '@/shared/ui/Input'
import { Select } from '@/shared/ui/Select'
import { useInquiryForm } from '../model/useInquiryForm'
import { formatPhone, stripPhone } from '../lib/format-phone'
import { LOGIN_TYPES, TELECOM_OPTIONS } from '../model/types'

const SEXES: Sex[] = ['male', 'female']

/**
 * 조회 기간에 쓸 연도 목록. 최신이 위다 — 최근 검진을 보려는 쪽이 흔하다.
 *
 * 1996년은 건강보험 전산 기록이 사실상 없는 하한이고, 그보다 앞을 고를 수 있게 해도
 * 빈 결과만 돌아온다. 달력이 아니라 연도인 것은 API가 `yyyy`만 받기 때문이다.
 */
const YEARS = Array.from({ length: new Date().getFullYear() - 1995 }, (_, index) => {
  const year = String(new Date().getFullYear() - index)
  return { value: year, label: year }
})

const LABEL = 'block text-sm font-medium text-slate-700'
const ERROR = 'mt-1 text-xs text-suspect'

/**
 * 인증 폼.
 *
 * 상태와 제출은 전부 `useInquiryForm`이 갖는다 — props가 없고 콜백도 안 받는다.
 * 라벨·도움말·에러 배선은 `shared/ui`의 `Field`가 맡는다.
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

      <Field id="legalName" label="이름" error={errors.legalName}>
        <Input
          id="legalName"
          autoComplete="name"
          value={form.legalName}
          onChange={(event) => setField('legalName', event.target.value)}
          disabled={isSubmitting}
          invalid={Boolean(errors.legalName)}
          aria-describedby={describedBy('legalName')}
        />
      </Field>

      <Field id="birthdate" label="생년월일" error={errors.birthdate}>
        <Input
          id="birthdate"
          className="tabular"
          inputMode="numeric"
          maxLength={8}
          placeholder="19900101"
          autoComplete="bday"
          value={form.birthdate}
          onChange={(event) => setField('birthdate', event.target.value)}
          disabled={isSubmitting}
          invalid={Boolean(errors.birthdate)}
          aria-describedby={describedBy('birthdate')}
        />
      </Field>

      <Field id="phoneNo" label="휴대폰 번호" error={errors.phoneNo}>
        {/*
          상태에는 숫자만 담고 표시할 때만 하이픈을 씌운다 — API로 가는 값은 11자리 그대로다.
          ponytail: 문자열 중간을 고치면 커서가 끝으로 간다.
          끝에서 타이핑·붙여넣기는 정상. 거슬리면 selectionStart 보정을 붙인다.
        */}
        <Input
          id="phoneNo"
          type="tel"
          className="tabular"
          inputMode="numeric"
          maxLength={13}
          placeholder="010-1234-5678"
          autoComplete="tel"
          value={formatPhone(form.phoneNo)}
          onChange={(event) => setField('phoneNo', stripPhone(event.target.value))}
          disabled={isSubmitting}
          invalid={Boolean(errors.phoneNo)}
          aria-describedby={describedBy('phoneNo')}
        />
      </Field>

      <Field id="telecom" label="통신사" error={errors.telecom}>
        <Select
          id="telecom"
          options={TELECOM_OPTIONS}
          placeholder="선택"
          value={form.telecom}
          onChange={(event) => setField('telecom', event.target.value)}
          disabled={isSubmitting}
          invalid={Boolean(errors.telecom)}
          aria-describedby={describedBy('telecom')}
        />
      </Field>

      <Field
        id="loginTypeLevel"
        as="span"
        label="인증 수단"
        help="평소 쓰는 인증 앱을 고르세요."
        error={errors.loginTypeLevel}
      >
        <ChoiceGrid
          choices={LOGIN_TYPES}
          basePath="/auth"
          label="인증 수단"
          value={form.loginTypeLevel}
          disabled={isSubmitting}
          invalid={Boolean(errors.loginTypeLevel)}
          describedBy={describedBy('loginTypeLevel', true)}
          onSelect={(value) => setField('loginTypeLevel', value)}
        />
      </Field>

      <Field id="period" as="span" label="조회 기간" error={errors.startDate}>
        <div className="flex items-center gap-2">
          <Select
            aria-label="조회 시작 연도"
            density="compact"
            className="tabular"
            options={YEARS}
            value={form.startDate}
            onChange={(event) => setField('startDate', event.target.value)}
            disabled={isSubmitting}
            invalid={Boolean(errors.startDate)}
            aria-describedby="period-error"
          />
          <span aria-hidden="true" className="text-sm text-slate-400">
            ~
          </span>
          <Select
            aria-label="조회 종료 연도"
            density="compact"
            className="tabular"
            options={YEARS}
            value={form.endDate}
            onChange={(event) => setField('endDate', event.target.value)}
            disabled={isSubmitting}
            aria-describedby="period-error"
          />
        </div>
      </Field>

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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '인증 요청 중…' : '인증 요청'}
      </Button>

      <p className="text-xs text-slate-500">입력한 정보는 조회에만 쓰이고 저장하지 않습니다.</p>
    </form>
  )
}
