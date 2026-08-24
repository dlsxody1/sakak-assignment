import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { useJudgementSex, type Sex } from '@/entities/user'
import { requestAuth } from '../api/request-checkup'
import { buildInquiryBody } from '../lib/build-body'
import { validateInquiry, type InquiryErrors } from '../lib/validate-form'
import { useInquiry } from './inquiry-store'
import type { InquiryForm } from './types'

const THIS_YEAR = String(new Date().getFullYear())

/**
 * 통신사와 인증 수단은 기본값을 두지 않는다 — 두면 하나가 조용히 선택된 채 제출된다.
 * 조회 기간은 반대로 기본값이 있어야 한다. 안 고르고 제출하는 게 정상인 필드라
 * 비워두면 매번 두 번 더 고르게 만든다.
 */
const EMPTY: InquiryForm = {
  legalName: '',
  birthdate: '',
  phoneNo: '',
  telecom: '',
  loginTypeLevel: '',
  startDate: '2015',
  endDate: THIS_YEAR,
}

/**
 * 인증 폼. 필드 상태와 1차 요청을 함께 갖는다.
 *
 * 성별은 폼 로컬 상태가 아니라 `entities/user`의 판정 기준에 바로 쓴다.
 * 판정이 쓰는 값이고 인증이 끝나도 남아야 해서, 임시 복사본을 두면
 * 두 곳이 어긋난다.
 */
export function useInquiryForm() {
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState<InquiryErrors>({})
  const judgementSex = useJudgementSex((state) => state.sex)
  const setJudgementSex = useJudgementSex((state) => state.setSex)
  // 판정 기준 성별은 대시보드가 쓰느라 항상 값이 있다(기본 남성).
  // 폼에는 "아직 안 고름"이 있어야 해서 선택 여부를 따로 센다 —
  // 안 그러면 남성이 조용히 선택된 채 제출되고 검증이 영영 안 걸린다.
  const [hasChosenSex, setHasChosenSex] = useState(false)
  const sex = hasChosenSex ? judgementSex : ''

  const setSex = (next: Sex) => {
    setJudgementSex(next)
    setHasChosenSex(true)
    setErrors((current) => ({ ...current, sex: undefined }))
  }
  const startWaiting = useInquiry((state) => state.startWaiting)
  const fail = useInquiry((state) => state.fail)
  const error = useInquiry((state) => state.error)

  const mutation = useMutation({
    mutationFn: async () => {
      const body = buildInquiryBody(form, crypto.randomUUID())
      const response = await requestAuth(body)
      return { body, multiFactorInfo: response.data }
    },
    onSuccess: ({ body, multiFactorInfo }) => startWaiting(body, multiFactorInfo),
    onError: (cause: Error) => fail(cause.message),
  })

  const setField = (key: keyof InquiryForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
    // 고치는 중에 빨간 글씨를 그대로 두면 이미 고친 것도 틀린 것처럼 보인다.
    setErrors((current) => ({ ...current, [key]: undefined }))
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const found = validateInquiry({ ...form, sex })
    setErrors(found)
    if (Object.keys(found).length === 0) mutation.mutate()
  }

  return {
    form,
    errors,
    setField,
    sex,
    setSex,
    submit,
    isSubmitting: mutation.isPending,
    error,
  }
}
