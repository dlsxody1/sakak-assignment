import { describe, expect, it } from 'vitest'

import { hasFinalConsonant, josa } from './josa'

describe('hasFinalConsonant', () => {
  it('한글 받침을 가린다', () => {
    expect(hasFinalConsonant('초')).toBe(false)
    expect(hasFinalConsonant('분')).toBe(true)
    expect(hasFinalConsonant('간')).toBe(true)
    expect(hasFinalConsonant('가')).toBe(false)
  })

  it('실제로 쓰는 시간 표기 — 상수가 바뀌어도 조사가 맞아야 한다', () => {
    expect(hasFinalConsonant('5분')).toBe(true)
    expect(hasFinalConsonant('4분 30초')).toBe(false)
    expect(hasFinalConsonant('45초')).toBe(false)
  })

  it('숫자로 끝나면 읽는 소리를 따른다', () => {
    expect(hasFinalConsonant('1')).toBe(true) // 일
    expect(hasFinalConsonant('2')).toBe(false) // 이
    expect(hasFinalConsonant('6')).toBe(true) // 육
    expect(hasFinalConsonant('9')).toBe(false) // 구
  })

  it('빈 문자열과 한글 아닌 글자는 없는 쪽으로 둔다', () => {
    expect(hasFinalConsonant('')).toBe(false)
    expect(hasFinalConsonant('   ')).toBe(false)
    expect(hasFinalConsonant('A')).toBe(false)
  })
})

describe('josa', () => {
  it('받침에 맞는 조사를 고른다 — 끝 글자만 본다', () => {
    // `분`은 받침이 있고 `초`는 없다. 앞의 숫자가 아니라 마지막 글자가 정한다.
    expect(josa('5분', '이', '가')).toBe('이')
    expect(josa('4분 30초', '이', '가')).toBe('가')
    expect(josa('45초', '이', '가')).toBe('가')
  })

  it('은/는, 을/를도 같은 규칙이다', () => {
    expect(josa('검진', '은', '는')).toBe('은')
    expect(josa('결과', '을', '를')).toBe('를')
  })
})
