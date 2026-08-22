/**
 * CANDiY 응답의 원형. 스칼라가 전부 string이고 빈 문자열이 결측이다.
 * `caseType`만 number로 온다 (문서에는 String이라고 적혀 있다).
 */
export interface CheckupResponse {
  status: string
  data: {
    patientName: string
    overviewList: RawOverview[]
    referenceList: RawReference[]
    resultList: RawResult[]
  }
}

/** 검진 1회차의 측정값. 검사항목 21키 + 날짜 + 종합판정. */
export type RawOverview = Record<string, string> & {
  checkupDate: string
  evaluation: string
}

/** refType 1행. 검사항목 21키를 기준 문자열로 갖는다. */
export type RawReference = Record<string, string> & { refType: string }

export interface RawResult {
  caseType: number
  checkupType: string
  checkupDate: string
  organizationName: string
  pdfData: string
  checkupFindings: string
  questionnaire: unknown[]
  infantsCheckupList: unknown[]
  infantsDentalList: unknown[]
}

/** 검사항목 키. referenceList와 overviewList가 공유한다. */
export const MEASUREMENT_KEYS = [
  'height',
  'weight',
  'waist',
  'BMI',
  'vision',
  'hearing',
  'bloodPressure',
  'proteinuria',
  'hemoglobin',
  'fastingBloodGlucose',
  'totalCholesterol',
  'HDLCholesterol',
  'triglyceride',
  'LDLCholesterol',
  'serumCreatinine',
  'GFR',
  'AST',
  'ALT',
  'yGPT',
  'chestXrayResult',
  'osteoporosis',
] as const

export type MeasurementKey = (typeof MEASUREMENT_KEYS)[number]

/** 항목 하나의 기준값 3종. 없는 refType은 빈 문자열이다. */
export interface Reference {
  unit: string
  normalA: string
  normalB: string
  suspect: string
}

/** 검진 1회차. 결측은 빈 문자열이 아니라 null이다. */
export interface Checkup {
  date: string
  /** API가 준 종합판정 (`정A`·`정B`·`의심`). 항목별 판정의 합이 아니라 별개 값이다. */
  evaluation: string
  values: Record<MeasurementKey, string | null>
}

export interface CheckupVisit {
  date: string
  type: string
  organizationName: string
}

export interface CheckupHistory {
  patientName: string
  /**
   * fixture에서 왔는지. 인증 없이 열었을 때 예시를 실제처럼 보여주지 않으려면
   * 화면이 출처를 알아야 한다.
   */
  isSample: boolean
  /** 오래된 순 — 차트가 이 순서를 그대로 쓴다. */
  checkups: Checkup[]
  /** 최신 순 — 이력 목록이 이 순서를 그대로 쓴다. */
  visits: CheckupVisit[]
  references: Record<MeasurementKey, Reference>
}
