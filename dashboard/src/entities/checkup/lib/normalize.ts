import {
  MEASUREMENT_KEYS,
  type Checkup,
  type CheckupHistory,
  type CheckupResponse,
  type CheckupVisit,
  type MeasurementKey,
  type RawOverview,
  type RawReference,
  type RawResult,
  type Reference,
} from '../model/types'

/** referenceList의 refType 라벨 → Reference의 필드명 */
const REF_TYPES: Record<string, keyof Reference> = {
  단위: 'unit',
  '정상(A)': 'normalA',
  '정상(B)': 'normalB',
  질환의심: 'suspect',
}

const EMPTY_REFERENCE: Reference = { unit: '', normalA: '', normalB: '', suspect: '' }

/** 빈 문자열은 결측이다. 결측과 '값이 0'을 구분하려면 null이어야 한다. */
const orNull = (value: string | undefined) => (value?.trim() ? value : null)

const byDateAsc = (a: { checkupDate: string }, b: { checkupDate: string }) =>
  a.checkupDate.localeCompare(b.checkupDate)

/** 같은 날짜에 일반·구강이 함께 온다. 표기 순서를 입력 순서에 맡기지 않는다. */
const VISIT_TYPE_ORDER = ['일반', '구강']
const byTypeOrder = (a: RawResult, b: RawResult) =>
  VISIT_TYPE_ORDER.indexOf(a.checkupType) - VISIT_TYPE_ORDER.indexOf(b.checkupType)

function toCheckup(overview: RawOverview): Checkup {
  const values = {} as Record<MeasurementKey, string | null>
  for (const key of MEASUREMENT_KEYS) values[key] = orNull(overview[key])

  return { date: overview.checkupDate, evaluation: overview.evaluation ?? '', values }
}

function toVisit(result: RawResult): CheckupVisit {
  return {
    date: result.checkupDate,
    type: result.checkupType,
    organizationName: result.organizationName,
  }
}

function toReferences(referenceList: RawReference[]): Record<MeasurementKey, Reference> {
  const references = {} as Record<MeasurementKey, Reference>
  for (const key of MEASUREMENT_KEYS) references[key] = { ...EMPTY_REFERENCE }

  for (const row of referenceList) {
    const field = REF_TYPES[row.refType]
    // 모르는 refType이 늘어도 무시한다. 기준이 하나 비면 그 구간만 판정에서 빠진다.
    if (!field) continue
    for (const key of MEASUREMENT_KEYS) references[key][field] = row[key] ?? ''
  }

  return references
}

/**
 * API 응답을 화면이 쓸 형태로 정규화한다.
 *
 * 하는 일 셋: 정렬 방향을 고정하고, 빈 문자열을 null로 바꾸고,
 * refType 4행을 항목별로 뒤집는다. 값 자체는 문자열로 둔다 —
 * `112/70`·`정상`처럼 숫자가 아닌 값이 섞여 있고, 해석은 판정 도메인의 일이다.
 *
 * `isSample`은 fixture 경로에서만 true다. 실 API와 fixture가 같은 정규화를
 * 지나므로, 출처는 여기서 한 번만 표시하고 화면은 그걸 읽기만 한다.
 */
export function normalizeCheckupResponse(
  response: CheckupResponse,
  isSample = false,
): CheckupHistory {
  const { patientName, overviewList, referenceList, resultList } = response.data

  return {
    patientName,
    isSample,
    // API가 주는 순서를 믿지 않는다. 차트는 오래된 순, 이력은 최신 순이 필요하다.
    checkups: [...overviewList].sort(byDateAsc).map(toCheckup),
    visits: [...resultList].sort((a, b) => byDateAsc(b, a) || byTypeOrder(a, b)).map(toVisit),
    references: toReferences(referenceList),
  }
}
