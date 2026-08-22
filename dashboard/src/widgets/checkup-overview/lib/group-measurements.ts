import { MEASUREMENT_GROUPS, type Measurement } from '@/entities/checkup'
import type { Judgement } from '@/entities/health-reference'

export interface MeasurementGroup {
  label: string
  items: Measurement<Judgement>[]
  /** 이 묶음의 질환의심 항목 수. 접힌 상태에서도 보여준다. */
  suspectCount: number
}

/**
 * 검사 항목을 묶음별로 나눈다. 빈 묶음은 버린다.
 *
 * `suspectCount`를 함께 주는 이유: 묶음이 접혀 있어도 그 안에 문제가 있는지
 * 알 수 있어야 접기가 정보를 숨기는 게 아니게 된다.
 */
export function groupMeasurements(measurements: Measurement<Judgement>[]): MeasurementGroup[] {
  const byKey = new Map(measurements.map((item) => [item.key, item]))

  return MEASUREMENT_GROUPS.map((group) => {
    const items = group.keys.flatMap((key) => byKey.get(key) ?? [])
    return {
      label: group.label,
      items,
      suspectCount: items.filter((item) => item.hasCriteria && item.judgement === 'suspect').length,
    }
  }).filter((group) => group.items.length > 0)
}
