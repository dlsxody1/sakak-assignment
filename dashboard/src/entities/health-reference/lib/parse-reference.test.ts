import { describe, expect, it } from 'vitest'

import { parseReference } from './parse-reference'

describe('parseReference', () => {
  describe('부등식', () => {
    it.each([
      ['100미만', { kind: 'lt', value: 100 }],
      ['1.6이하', { kind: 'lte', value: 1.6 }],
      ['60이상', { kind: 'gte', value: 60 }],
      ['1.6초과', { kind: 'gt', value: 1.6 }],
    ])('%s', (input, expected) => {
      expect(parseReference(input)).toEqual(expected)
    })
  })

  describe('범위', () => {
    it('하이픈으로 구분한다', () => {
      expect(parseReference('18.5-24.9')).toEqual({ kind: 'range', min: 18.5, max: 24.9 })
    })

    it('물결도 하이픈과 같게 파싱한다', () => {
      expect(parseReference('25~29.9')).toEqual({ kind: 'range', min: 25, max: 29.9 })
    })

    it('정수 범위', () => {
      expect(parseReference('41-50')).toEqual({ kind: 'range', min: 41, max: 50 })
    })
  })

  describe('성별 분기 — 표기 흔들림 3종', () => {
    it('공백 구분 (waist)', () => {
      expect(parseReference('남 90이상 / 여 85이상')).toEqual({
        kind: 'bySex',
        male: { kind: 'gte', value: 90 },
        female: { kind: 'gte', value: 85 },
      })
    })

    it('콜론+공백 구분 (hemoglobin 정상A)', () => {
      expect(parseReference('남: 13-16.5 / 여: 12-15.5')).toEqual({
        kind: 'bySex',
        male: { kind: 'range', min: 13, max: 16.5 },
        female: { kind: 'range', min: 12, max: 15.5 },
      })
    })

    it('콜론만 구분 (yGPT 정상A)', () => {
      expect(parseReference('남:11-63 / 여:8-35')).toEqual({
        kind: 'bySex',
        male: { kind: 'range', min: 11, max: 63 },
        female: { kind: 'range', min: 8, max: 35 },
      })
    })
  })

  describe('/ 의 의미 구분', () => {
    // 같은 문자가 항목마다 다른 뜻이라 여기서 갈라진다. 범용 '/' 처리는 반드시 틀린다.
    it('성별 접두가 없으면 합집합이다 (BMI 정상B)', () => {
      expect(parseReference('18.5미만/25~29.9')).toEqual({
        kind: 'union',
        of: [
          { kind: 'lt', value: 18.5 },
          { kind: 'range', min: 25, max: 29.9 },
        ],
      })
    })

    it('이며가 있으면 수축기/이완기 AND (혈압 정상A)', () => {
      expect(parseReference('120미만 이며/80미만')).toEqual({
        kind: 'bloodPressure',
        systolic: { kind: 'lt', value: 120 },
        diastolic: { kind: 'lt', value: 80 },
        op: 'and',
      })
    })

    it('또는이 있으면 수축기/이완기 OR (혈압 질환의심)', () => {
      expect(parseReference('140이상 또는 /90이상')).toEqual({
        kind: 'bloodPressure',
        systolic: { kind: 'gte', value: 140 },
        diastolic: { kind: 'gte', value: 90 },
        op: 'or',
      })
    })

    it('혈압 정상B는 양쪽이 범위인 OR', () => {
      expect(parseReference('120-139 또는 /80-89')).toEqual({
        kind: 'bloodPressure',
        systolic: { kind: 'range', min: 120, max: 139 },
        diastolic: { kind: 'range', min: 80, max: 89 },
        op: 'or',
      })
    })
  })

  describe('문자열', () => {
    it('단일 값', () => {
      expect(parseReference('음성')).toEqual({ kind: 'text', accepts: ['음성'] })
    })

    it('쉼표로 나열한 허용값 집합 (chestXray 정상A)', () => {
      expect(parseReference('정상, 비활동성')).toEqual({
        kind: 'text',
        accepts: ['정상', '비활동성'],
      })
    })

    it('단백뇨 이상 접미사는 서열을 펼친다', () => {
      // 실제 값은 '양성(+1)' 인데 기준은 '양성(+1)이상' 이라 완전일치가 실패한다.
      expect(parseReference('양성(+1)이상')).toEqual({
        kind: 'text',
        accepts: ['양성(+1)', '양성(+2)', '양성(+3)'],
      })
    })

    it('약양성±도 서열에 있다', () => {
      expect(parseReference('약양성±')).toEqual({ kind: 'text', accepts: ['약양성±'] })
    })
  })

  describe('T-score', () => {
    it('접두 라벨을 떼고 음수를 읽는다', () => {
      expect(parseReference('T-score -1 이상')).toEqual({ kind: 'gte', value: -1 })
    })

    it('음수 부등식', () => {
      expect(parseReference('-2.5이하')).toEqual({ kind: 'lte', value: -2.5 })
    })
  })

  describe('파싱 실패는 null이다', () => {
    // 실패를 예외 테이블로 덮지 않는다. null이 판정불가로 이어지는 게 올바른 동작이다.
    it('빈 문자열', () => {
      expect(parseReference('')).toBeNull()
    })

    it('공백만', () => {
      expect(parseReference('   ')).toBeNull()
    })

    it('문법이 깨진 osteoporosis 정상B — 버그가 아니라 결정이다', () => {
      // '-1~-2.5 초과': 역순 범위(-1 > -2.5)에 부등식이 붙어 의미가 모호하다.
      // 추측해서 판정하느니 판정불가로 남긴다.
      expect(parseReference('-1~-2.5 초과')).toBeNull()
    })

    it('여집합 서술은 해석하지 않는다 (chestXray 질환의심)', () => {
      // '정상 및 비활동성이외의자' 는 "그 외 전부"라 구간으로 표현할 수 없다.
      expect(parseReference('정상 및 비활동성이외의자')).toBeNull()
    })
  })
})
