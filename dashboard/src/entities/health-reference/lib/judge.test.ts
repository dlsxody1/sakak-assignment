import { describe, expect, it } from 'vitest'

import { judge } from './judge'

// fixture를 읽지 않고 기준 문자열을 그대로 적는다. 왜 그 판정이 나오는지가
// 테스트 본문에서 바로 읽혀야 회귀 기준으로 쓸모가 있다.
const LDL = { normalA: '130미만', normalB: '130-139', suspect: '160이상' }
const HEMOGLOBIN = {
  normalA: '남: 13-16.5 / 여: 12-15.5',
  normalB: '남: 12-12.9 / 여: 10-11.9',
  suspect: '남:12.0미만 / 여:10.0미만',
}
const BLOOD_PRESSURE = {
  normalA: '120미만 이며/80미만',
  normalB: '120-139 또는 /80-89',
  suspect: '140이상 또는 /90이상',
}
const CREATININE = { normalA: '1.6이하', normalB: '', suspect: '1.6초과' }
const HDL = { normalA: '60이상', normalB: '40-59', suspect: '40미만' }
const WAIST = { normalA: '', normalB: '', suspect: '남 90이상 / 여 85이상' }
const BMI = { normalA: '18.5-24.9', normalB: '18.5미만/25~29.9', suspect: '30이상' }
const OSTEOPOROSIS = { normalA: 'T-score -1 이상', normalB: '-1~-2.5 초과', suspect: '-2.5이하' }
const PROTEINURIA = { normalA: '음성', normalB: '약양성±', suspect: '양성(+1)이상' }
const NO_CRITERIA = { normalA: '', normalB: '', suspect: '' }

describe('judge', () => {
  describe('회귀 기준', () => {
    it('2022 LDL=148 은 정상B 상한과 질환의심 하한 사이 공백이라 판정불가', () => {
      expect(judge(LDL, '148', 'male')).toBe('undetermined')
    })

    it('2024 Hb=16.8 은 남 정상A 상한 16.5 를 넘어 어느 구간에도 없다', () => {
      expect(judge(HEMOGLOBIN, '16.8', 'male')).toBe('undetermined')
    })

    it('2025 BP=142/88 은 OR 에서 수축기만 걸려도 질환의심', () => {
      expect(judge(BLOOD_PRESSURE, '142/88', 'male')).toBe('suspect')
    })

    it('2021·2023 지질 결측은 미측정', () => {
      expect(judge(LDL, '', 'male')).toBe('unmeasured')
    })

    it('osteoporosis 는 전 회차 결측이라 미측정 — 기준 문법이 깨진 것보다 먼저다', () => {
      expect(judge(OSTEOPOROSIS, '', 'female')).toBe('unmeasured')
    })
  })

  describe('혈압 복합 조건', () => {
    it('AND 는 둘 다 걸려야 정상A', () => {
      expect(judge(BLOOD_PRESSURE, '112/70', 'male')).toBe('normalA')
    })

    it('수축기만 정상A 범위면 정상A가 아니다', () => {
      // 118/85 → 수축기 <120 이지만 이완기 85 는 80 이상. AND 실패 후 정상B의 OR에 걸린다.
      expect(judge(BLOOD_PRESSURE, '118/85', 'male')).toBe('normalB')
    })

    it('이완기만 걸려도 질환의심', () => {
      expect(judge(BLOOD_PRESSURE, '130/95', 'male')).toBe('suspect')
    })

    it('값이 수축기/이완기 형태가 아니면 판정불가', () => {
      expect(judge(BLOOD_PRESSURE, '142', 'male')).toBe('undetermined')
    })
  })

  describe('구간 순회', () => {
    it('정상A가 먼저 매칭된다 (HDL 60이상)', () => {
      expect(judge(HDL, '62', 'male')).toBe('normalA')
    })

    it('경계값은 구간에 포함된다', () => {
      expect(judge(HDL, '60', 'male')).toBe('normalA')
      expect(judge(HDL, '59', 'male')).toBe('normalB')
      expect(judge(HDL, '40', 'male')).toBe('normalB')
      expect(judge(HDL, '39', 'male')).toBe('suspect')
    })

    it('정상B가 비어도 2단계로 판정된다 (serumCreatinine)', () => {
      expect(judge(CREATININE, '0.9', 'male')).toBe('normalA')
      expect(judge(CREATININE, '1.6', 'male')).toBe('normalA')
      expect(judge(CREATININE, '1.7', 'male')).toBe('suspect')
    })

    it('합집합 구간 (BMI 정상B 는 저체중과 과체중 양쪽)', () => {
      expect(judge(BMI, '17', 'male')).toBe('normalB')
      expect(judge(BMI, '27', 'male')).toBe('normalB')
      expect(judge(BMI, '21.8', 'male')).toBe('normalA')
      expect(judge(BMI, '31', 'male')).toBe('suspect')
    })
  })

  describe('성별 분기', () => {
    it('같은 값이 성별에 따라 다르게 판정된다 (Hb 12.5)', () => {
      // 남: 정상B 12-12.9 / 여: 정상A 12-15.5
      expect(judge(HEMOGLOBIN, '12.5', 'male')).toBe('normalB')
      expect(judge(HEMOGLOBIN, '12.5', 'female')).toBe('normalA')
    })

    it('waist 는 질환의심 기준만 있어 정상 범위가 판정불가로 남는다', () => {
      // 기준이 "이상이면 위험"만 정의한다. 87 이 남성에게 안전하다고 말할 근거가
      // 데이터에 없으므로 정상이라고 하지 않는다.
      expect(judge(WAIST, '87', 'male')).toBe('undetermined')
      expect(judge(WAIST, '87', 'female')).toBe('suspect')
    })
  })

  describe('문자열 판정', () => {
    it('단백뇨 등급', () => {
      expect(judge(PROTEINURIA, '음성', 'male')).toBe('normalA')
      expect(judge(PROTEINURIA, '약양성±', 'male')).toBe('normalB')
    })

    it('실제 값 양성(+1) 이 기준 양성(+1)이상 에 걸린다', () => {
      expect(judge(PROTEINURIA, '양성(+1)', 'male')).toBe('suspect')
    })
  })

  describe('입력 검증', () => {
    it('기준이 전부 비면 판정불가 (height·weight·vision·hearing)', () => {
      expect(judge(NO_CRITERIA, '171.5', 'male')).toBe('undetermined')
    })

    it('측정값 결측이 기준 없음보다 우선한다', () => {
      expect(judge(NO_CRITERIA, '', 'male')).toBe('unmeasured')
    })

    it('공백만 있는 측정값도 미측정', () => {
      expect(judge(LDL, '   ', 'male')).toBe('unmeasured')
    })

    it('숫자 기준에 숫자가 아닌 값이 오면 판정불가 — 0으로 읽지 않는다', () => {
      expect(judge(LDL, '정상', 'male')).toBe('undetermined')
    })
  })
})
