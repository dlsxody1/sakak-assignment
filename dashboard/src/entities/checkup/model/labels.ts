import type { MeasurementKey } from './types'

/** 검사항목의 한글 이름. API는 영문 키만 준다. */
export const MEASUREMENT_LABELS: Record<MeasurementKey, string> = {
  height: '신장',
  weight: '체중',
  waist: '허리둘레',
  BMI: '체질량지수',
  vision: '시력',
  hearing: '청력',
  bloodPressure: '혈압',
  proteinuria: '요단백',
  hemoglobin: '혈색소',
  fastingBloodGlucose: '공복혈당',
  totalCholesterol: '총콜레스테롤',
  HDLCholesterol: 'HDL 콜레스테롤',
  triglyceride: '중성지방',
  LDLCholesterol: 'LDL 콜레스테롤',
  serumCreatinine: '혈청크레아티닌',
  GFR: '신사구체여과율',
  AST: 'AST',
  ALT: 'ALT',
  yGPT: '감마지티피',
  chestXrayResult: '흉부촬영',
  osteoporosis: '골밀도',
}

/**
 * 검사 묶음. 화면에서 관련 항목을 붙여 보여준다.
 *
 * `계측`은 판정 기준이 없는 항목들이다 — 판정 배지 없이 수치만 보여주는 그룹이라
 * 나머지와 성격이 다르다.
 */
export const MEASUREMENT_GROUPS: { label: string; keys: MeasurementKey[] }[] = [
  { label: '계측', keys: ['height', 'weight', 'waist', 'BMI', 'vision', 'hearing'] },
  { label: '혈압', keys: ['bloodPressure'] },
  { label: '당뇨', keys: ['fastingBloodGlucose'] },
  {
    label: '지질',
    keys: ['totalCholesterol', 'HDLCholesterol', 'triglyceride', 'LDLCholesterol'],
  },
  { label: '신장', keys: ['serumCreatinine', 'GFR', 'proteinuria'] },
  { label: '간', keys: ['AST', 'ALT', 'yGPT'] },
  { label: '기타', keys: ['hemoglobin', 'chestXrayResult', 'osteoporosis'] },
]
