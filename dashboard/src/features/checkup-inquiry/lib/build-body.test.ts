import { describe, expect, it } from 'vitest'

import { buildInquiryBody } from './build-body'
import type { InquiryForm } from '../model/types'

const FORM: InquiryForm = {
  legalName: '홍길동',
  birthdate: '19900101',
  phoneNo: '01012345678',
  telecom: 'SKT',
  loginTypeLevel: '8',
  startDate: '2015',
  endDate: '2026',
}

describe('buildInquiryBody', () => {
  it('probe가 확인한 형태 그대로 만든다', () => {
    expect(buildInquiryBody(FORM, 'fixed-id')).toEqual({
      id: 'fixed-id',
      loginTypeLevel: '8',
      legalName: '홍길동',
      birthdate: '19900101',
      phoneNo: '01012345678',
      telecom: '0',
      startDate: '2015',
      endDate: '2026',
      inquiryType: '0',
    })
  })

  it('통신사 라벨을 코드로 바꾼다 — 폼은 라벨을, API는 코드를 쓴다', () => {
    expect(buildInquiryBody({ ...FORM, telecom: 'LG U+' }, 'x').telecom).toBe('2')
  })

  it('알뜰폰은 모회사 망 코드로 간다 — 미검증 코드를 보내지 않는다', () => {
    expect(buildInquiryBody({ ...FORM, telecom: 'SKT 알뜰폰' }, 'x').telecom).toBe('0')
    expect(buildInquiryBody({ ...FORM, telecom: 'KT 알뜰폰' }, 'x').telecom).toBe('1')
    expect(buildInquiryBody({ ...FORM, telecom: 'LG U+ 알뜰폰' }, 'x').telecom).toBe('2')
  })

  it('모르는 통신사는 빈 값 — 프록시 필수 검사에 걸려 CANDiY까지 안 간다', () => {
    expect(buildInquiryBody({ ...FORM, telecom: '없는통신사' }, 'x').telecom).toBe('')
  })

  it('이름의 앞뒤 공백을 턴다 — 자동완성이 공백을 붙이는 경우가 있다', () => {
    expect(buildInquiryBody({ ...FORM, legalName: '  홍길동 ' }, 'x').legalName).toBe('홍길동')
  })

  it('휴대폰 번호는 숫자만 담긴 채로 그대로 간다 — 하이픈은 표시에만 있다', () => {
    expect(buildInquiryBody(FORM, 'x').phoneNo).toBe('01012345678')
  })
})
