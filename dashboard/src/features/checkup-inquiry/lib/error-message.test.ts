import { describe, expect, it } from 'vitest'

import { messageForStatus } from './error-message'

describe('messageForStatus', () => {
  it('4xx 입력 오류는 무엇을 고쳐야 하는지 말한다', () => {
    expect(messageForStatus(400)).toContain('입력한 정보')
    expect(messageForStatus(422)).toContain('입력한 정보')
  })

  it('5xx는 사용자 입력 문제로 말하지 않는다', () => {
    for (const status of [500, 502, 503]) {
      expect(messageForStatus(status)).not.toContain('입력')
      expect(messageForStatus(status)).toContain('서버')
    }
  })

  it('429는 다시 시도할 시점을 알려준다', () => {
    expect(messageForStatus(429)).toContain('1분')
  })

  it('모르는 상태코드도 문장으로 떨어진다', () => {
    expect(messageForStatus(418)).toBeTruthy()
    expect(messageForStatus(0)).toBeTruthy()
  })

  it('원인이 다르면 문장도 다르다 — 하나로 뭉개지 않는다', () => {
    const messages = [400, 401, 404, 429, 500].map(messageForStatus)
    expect(new Set(messages).size).toBe(messages.length)
  })
})
