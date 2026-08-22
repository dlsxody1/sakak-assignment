import {
  MEASUREMENT_LABELS,
  type CheckupHistory,
  type Measurement,
  type MeasurementKey,
} from '@/entities/checkup'
import { judge, type Judgement, type Sex } from '@/entities/health-reference'

/**
 * 검진 이력에 판정을 입힌다. 두 엔티티가 만나는 지점이다 —
 * `checkup`이 값을, `health-reference`가 판정을 주고 여기서 합쳐진다.
 */
export function buildMeasurements(
  history: CheckupHistory,
  sex: Sex,
): Measurement<Judgement>[] {
  const latest = history.checkups.at(-1)

  return (Object.keys(MEASUREMENT_LABELS) as MeasurementKey[]).map((key) => {
    const reference = history.references[key]
    const criteria = {
      normalA: reference.normalA,
      normalB: reference.normalB,
      suspect: reference.suspect,
    }
    const value = latest?.values[key] ?? null

    return {
      key,
      label: MEASUREMENT_LABELS[key],
      unit: reference.unit,
      value,
      judgement: judge(criteria, value ?? '', sex),
      // 기준 3종이 전부 비면 판정 대상이 아니다 (신장·체중·시력·청력).
      hasCriteria: Boolean(criteria.normalA || criteria.normalB || criteria.suspect),
      criteria,
      series: history.checkups.map((checkup) => ({
        date: checkup.date,
        value: checkup.values[key],
        judgement: judge(criteria, checkup.values[key] ?? '', sex),
      })),
    }
  })
}
