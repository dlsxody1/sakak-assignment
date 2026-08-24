import { describe, expect, it } from 'vitest'

import { formatPhone, stripPhone } from './format-phone'

describe('stripPhone', () => {
  it('하이픈을 지운다 — 붙여넣은 010-1234-5678이 그냥 통과해야 한다', () => {
    expect(stripPhone('010-1234-5678')).toBe('01012345678')
  })

  it('공백과 괄호도 지운다 — 주소록에서 복사하면 따라온다', () => {
    expect(stripPhone(' (010) 1234 5678 ')).toBe('01012345678')
  })

  it('11자리를 넘기면 자른다 — 휴대폰 번호는 그보다 길지 않다', () => {
    expect(stripPhone('010123456789999')).toBe('01012345678')
  })

  it('빈 값은 빈 값 — 지우다 만 상태가 깨지면 안 된다', () => {
    expect(stripPhone('')).toBe('')
  })
})

describe('formatPhone', () => {
  it('11자리를 3-4-4로 끊는다', () => {
    expect(formatPhone('01012345678')).toBe('010-1234-5678')
  })

  it('3자리까지는 하이픈이 없다 — 010을 치자마자 붙으면 커서가 튄 것처럼 보인다', () => {
    expect(formatPhone('010')).toBe('010')
  })

  it('4~7자리는 하이픈 하나 — 타이핑 도중에도 형태가 무너지지 않는다', () => {
    expect(formatPhone('0101')).toBe('010-1')
    expect(formatPhone('0101234')).toBe('010-1234')
  })

  it('8자리부터 두 번째 하이픈', () => {
    expect(formatPhone('01012345')).toBe('010-1234-5')
  })

  it('빈 값은 빈 값 — placeholder가 보여야 한다', () => {
    expect(formatPhone('')).toBe('')
  })

  it('stripPhone을 거친 값을 되돌리면 원래 표기다 — 왕복이 안정적이어야 한다', () => {
    expect(formatPhone(stripPhone('010-1234-5678'))).toBe('010-1234-5678')
  })
})
