import { describe, expect, it } from 'vitest'

import { validateInquiry } from './validate-form'
import type { InquiryInput } from '../model/types'

const VALID: InquiryInput = {
  legalName: '홍길동',
  birthdate: '19900101',
  phoneNo: '01012345678',
  telecom: '0',
  startDate: '2015',
  endDate: '2026',
  sex: 'male',
}

describe('validateInquiry', () => {
  it('모두 채우면 오류가 없다', () => {
    expect(validateInquiry(VALID)).toEqual({})
  })

  it('공백만 있는 이름은 비어 있는 것으로 본다', () => {
    expect(validateInquiry({ ...VALID, legalName: '   ' })).toHaveProperty('legalName')
  })

  it('생년월일은 8자리 — 6자리 주민번호 앞자리를 넣는 실수를 잡는다', () => {
    expect(validateInquiry({ ...VALID, birthdate: '900101' })).toHaveProperty('birthdate')
  })

  it('하이픈 넣은 휴대폰 번호를 거른다 — API는 숫자만 받는다', () => {
    expect(validateInquiry({ ...VALID, phoneNo: '010-1234-5678' })).toHaveProperty('phoneNo')
  })

  it('010으로 시작하지 않으면 거른다', () => {
    expect(validateInquiry({ ...VALID, phoneNo: '01112345678' })).toHaveProperty('phoneNo')
  })

  it('통신사 미선택을 잡는다 — 기본값을 두면 SKT가 조용히 선택된다', () => {
    expect(validateInquiry({ ...VALID, telecom: '' })).toHaveProperty('telecom')
  })

  it('성별 미선택을 잡는다 — 없으면 판정이 조용히 틀린다', () => {
    expect(validateInquiry({ ...VALID, sex: '' })).toHaveProperty('sex')
  })

  it('오류가 여러 개면 전부 모아서 돌려준다 — 한 번에 고치게', () => {
    const errors = validateInquiry({ ...VALID, birthdate: '', phoneNo: '', sex: '' })
    expect(Object.keys(errors).sort()).toEqual(['birthdate', 'phoneNo', 'sex'])
  })
})
