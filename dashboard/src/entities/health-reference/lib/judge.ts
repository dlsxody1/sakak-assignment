import type { Criterion, Judgement, ReferenceValues, Sex } from '../model/types'
import { parseReference } from './parse-reference'

/**
 * 나쁜 쪽부터 본다. 대부분의 항목은 구간이 겹치지 않아 순서가 무의미하지만
 * 혈압은 다르다 — `142/88`은 정상B(`120-139 또는 /80-89`)의 이완기 조건과
 * 질환의심(`140이상 또는 /90이상`)의 수축기 조건에 **동시에** 걸린다.
 * OR 조건이 겹치는 이상 둘 다 참일 수 있고, 그때 답은 나쁜 쪽이다.
 */
const ORDER = ['suspect', 'normalB', 'normalA'] as const satisfies ReadonlyArray<
  keyof ReferenceValues & Judgement
>

function matchesNumber(criterion: Criterion, value: number): boolean {
  switch (criterion.kind) {
    case 'lt':
      return value < criterion.value
    case 'lte':
      return value <= criterion.value
    case 'gt':
      return value > criterion.value
    case 'gte':
      return value >= criterion.value
    case 'range':
      return value >= criterion.min && value <= criterion.max
    case 'union':
      return criterion.of.some((c) => matchesNumber(c, value))
    default:
      return false
  }
}

function matches(criterion: Criterion, measured: string, sex: Sex): boolean {
  switch (criterion.kind) {
    case 'text':
      return criterion.accepts.includes(measured)

    case 'bySex':
      return matches(sex === 'male' ? criterion.male : criterion.female, measured, sex)

    case 'bloodPressure': {
      const [systolic, diastolic] = measured.split('/').map(Number)
      if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) return false
      const hitsSystolic = matchesNumber(criterion.systolic, systolic)
      const hitsDiastolic = matchesNumber(criterion.diastolic, diastolic)
      return criterion.op === 'and' ? hitsSystolic && hitsDiastolic : hitsSystolic || hitsDiastolic
    }

    default: {
      // 나머지는 전부 수치 기준이다. 숫자로 읽히지 않으면 걸리지 않은 것으로 둔다.
      // 조용히 0으로 만들면 `0미만` 같은 기준에 엉뚱하게 걸린다.
      const value = Number(measured)
      return Number.isFinite(value) && matchesNumber(criterion, value)
    }
  }
}

/**
 * 검진 항목 하나를 판정한다.
 *
 * 문자열만 받는다 — 이 도메인은 API 응답 타입도 React도 모른다.
 * 해석하지 못한 기준은 건너뛰고, 어디에도 걸리지 않으면 `undetermined`다.
 * 모르는 것을 정상으로 표시하지 않는 게 이 함수의 규칙이다.
 */
export function judge(references: ReferenceValues, measured: string, sex: Sex): Judgement {
  if (!measured.trim()) return 'unmeasured'

  for (const key of ORDER) {
    const criterion = parseReference(references[key])
    if (criterion && matches(criterion, measured.trim(), sex)) return key
  }

  return 'undetermined'
}
