import { describe, expect, it } from 'vitest'

import fixture from '@/shared/api/__fixtures__/checkup-response.json'
import { normalizeCheckupResponse } from './normalize'
import type { CheckupResponse } from '../model/types'

const history = normalizeCheckupResponse(fixture as CheckupResponse)

describe('normalizeCheckupResponse', () => {
  describe('정렬 정규화', () => {
    // API가 두 배열을 반대 방향으로 준다. 화면마다 필요한 방향이 달라서
    // 여기서 한 번 정해두고 소비 측은 그대로 쓴다.
    it('checkups는 오래된 순이다 (API overviewList와 같은 방향)', () => {
      const dates = history.checkups.map((c) => c.date)
      expect(dates).toEqual([...dates].sort())
      expect(dates[0]).toBe('2020-04-06')
      expect(dates.at(-1)).toBe('2025-09-16')
    })

    it('visits는 최신 순이다 (API resultList와 같은 방향)', () => {
      const dates = history.visits.map((v) => v.date)
      expect(dates).toEqual([...dates].sort().reverse())
      expect(dates[0]).toBe('2025-09-16')
    })

    it('같은 날짜 안에서는 일반이 구강보다 먼저다', () => {
      // Array.sort는 안정 정렬이라 동점이면 입력 순서가 그대로 남는다.
      // API 순서에 맡기면 회차마다 순서가 달라질 수 있어 명시적으로 고정한다.
      expect(history.visits.slice(0, 2).map((v) => v.type)).toEqual(['일반', '구강'])
    })

    it('입력 순서가 뒤집혀 와도 결과는 같다', () => {
      const reversed = {
        ...fixture,
        data: {
          ...fixture.data,
          overviewList: [...fixture.data.overviewList].reverse(),
          resultList: [...fixture.data.resultList].reverse(),
        },
      } as CheckupResponse

      const result = normalizeCheckupResponse(reversed)
      expect(result.checkups.map((c) => c.date)).toEqual(history.checkups.map((c) => c.date))
      expect(result.visits).toEqual(history.visits)
    })
  })

  describe('결측 처리', () => {
    it('빈 문자열은 null이 된다', () => {
      // 2021·2023 지질 4종은 격년 검사라 통째로 빠져 있다.
      const y2021 = history.checkups.find((c) => c.date.startsWith('2021'))!
      expect(y2021.values.LDLCholesterol).toBeNull()
      expect(y2021.values.totalCholesterol).toBeNull()
      expect(y2021.values.HDLCholesterol).toBeNull()
      expect(y2021.values.triglyceride).toBeNull()
    })

    it('측정된 값은 문자열 그대로 둔다 — 숫자로 바꾸지 않는다', () => {
      // bloodPressure '112/70', vision '1.2/1.0' 처럼 숫자가 아닌 값이 있다.
      const y2020 = history.checkups[0]
      expect(y2020.values.bloodPressure).toBe('112/70')
      expect(y2020.values.height).toBe('171.5')
    })

    it('osteoporosis는 전 회차 결측이다', () => {
      expect(history.checkups.every((c) => c.values.osteoporosis === null)).toBe(true)
    })

    it('모든 회차가 검사항목 21키를 빠짐없이 갖는다', () => {
      for (const checkup of history.checkups) {
        expect(Object.keys(checkup.values)).toHaveLength(21)
      }
    })
  })

  describe('기준값', () => {
    it('refType 4종을 항목별로 묶는다', () => {
      expect(history.references.LDLCholesterol).toEqual({
        unit: 'mg/dL',
        normalA: '130미만',
        normalB: '130-139',
        suspect: '160이상',
      })
    })

    it('기준이 없는 항목은 빈 문자열로 채운다', () => {
      expect(history.references.vision).toEqual({
        unit: '',
        normalA: '',
        normalB: '',
        suspect: '',
      })
    })

    it('검사항목 21개 전부에 기준 항목이 있다', () => {
      expect(Object.keys(history.references)).toHaveLength(21)
    })
  })

  describe('방문 이력', () => {
    it('날짜당 일반·구강 2건이 온다', () => {
      expect(history.visits).toHaveLength(12)
      expect(history.visits.filter((v) => v.type === '일반')).toHaveLength(6)
      expect(history.visits.filter((v) => v.type === '구강')).toHaveLength(6)
    })

    it('종류는 checkupType으로 구분한다', () => {
      // organizationName으로 구분하고 싶어지지만 기관명은 병원마다 다르다.
      expect(history.visits[0].type).toBe('일반')
      expect(history.visits[0].organizationName).toBe('가온종합건진센터')
    })
  })

  describe('종합판정', () => {
    it('API가 준 evaluation을 그대로 보관한다', () => {
      // '정A'·'정B'·'의심' — refType 라벨('정상(A)')과 표기가 다르지만
      // 우리 판정과 별개 값이라 변환하지 않는다.
      expect(history.checkups[0].evaluation).toBe('정A')
      expect(history.checkups.at(-1)!.evaluation).toBe('의심')
    })
  })

  it('환자명을 옮긴다', () => {
    expect(history.patientName).toBe('김건강')
  })
})
