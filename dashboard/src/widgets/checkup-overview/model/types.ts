import type { Measurement, VisitDay } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'
import type { Sex } from '@/entities/user'
import type { JudgementCount } from '../lib/summarize'

/** 대시보드 한 화면이 쓰는 데이터. 여러 컴포넌트가 공유하므로 여기 둔다. */
export interface CheckupOverview {
  patientName: string
  latestDate: string
  /** 어느 기준으로 판정했는지. 컨트롤은 인증 폼에 있고 여기서는 표시만 한다. */
  sex: Sex
  /** API가 준 종합판정. 우리 항목별 판정의 합이 아니라 별개 값이다. */
  evaluation: string
  measurements: Measurement<Judgement>[]
  distribution: JudgementCount[]
  attention: Measurement<Judgement>[]
  undeterminedCount: number
  visitDays: VisitDay[]
}
