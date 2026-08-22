import type { Criterion } from '../model/types'

/**
 * 단백뇨 등급 서열. `양성(+1)이상` 같은 기준을 완전일치 집합으로 펼치는 데 쓴다.
 *
 * ponytail: API가 등급 목록을 주지 않아 하드코딩했다. 새 등급이 오면 여기 추가한다.
 * 서열이 필요한 항목이 단백뇨 하나뿐이라 범용 서열 테이블은 만들지 않았다.
 */
const PROTEINURIA_GRADES = ['음성', '약양성±', '양성(+1)', '양성(+2)', '양성(+3)']

const COMPARATORS = { 미만: 'lt', 이하: 'lte', 이상: 'gte', 초과: 'gt' } as const

/** `100미만`, `-2.5이하`, `T-score -1 이상` */
const COMPARISON = /^(-?[\d.]+)\s*(미만|이하|이상|초과)$/
/** `18.5-24.9`, `25~29.9`. 음수 범위는 이 데이터에 없다 */
const RANGE = /^([\d.]+)\s*[-~]\s*([\d.]+)$/
/** `남 90이상`, `남: 13-16.5`, `남:11-63` — 표기 흔들림 3종을 한 번에 흡수한다 */
const SEX_PREFIX = /^(남|여)\s*:?\s*/

/** 숫자로 읽되 `1.2.3` 같은 쓰레기는 거른다 */
function toNumber(raw: string): number | null {
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

function parseComparison(input: string): Criterion | null {
  const m = COMPARISON.exec(input)
  if (!m) return null
  const value = toNumber(m[1])
  return value === null ? null : { kind: COMPARATORS[m[2] as keyof typeof COMPARATORS], value }
}

function parseRange(input: string): Criterion | null {
  const m = RANGE.exec(input)
  if (!m) return null
  const min = toNumber(m[1])
  const max = toNumber(m[2])
  // 역순 범위(`-1~-2.5`)는 의도를 추측하지 않고 실패시킨다.
  if (min === null || max === null || min > max) return null
  return { kind: 'range', min, max }
}

function parseText(input: string): Criterion | null {
  // `양성(+1)이상` — 서열에서 그 등급 이상을 전부 허용값으로 펼친다.
  const graded = /^(.+?)\s*이상$/.exec(input)
  if (graded) {
    const from = PROTEINURIA_GRADES.indexOf(graded[1])
    if (from !== -1) return { kind: 'text', accepts: PROTEINURIA_GRADES.slice(from) }
  }

  // `정상, 비활동성` — 쉼표로 나열한 허용값 집합
  const accepts = input
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (accepts.length > 1) return { kind: 'text', accepts }

  // 단일 값은 알려진 등급일 때만 받는다. 그러지 않으면 `정상 및 비활동성이외의자`
  // 같은 여집합 서술까지 완전일치 기준으로 삼게 된다.
  return PROTEINURIA_GRADES.includes(input) || input === '정상'
    ? { kind: 'text', accepts: [input] }
    : null
}

/** 성별·논리연산자 조합이 없는 단일 항. */
function parseAtom(input: string): Criterion | null {
  const trimmed = input.trim().replace(/^T-score\s*/i, '')
  if (!trimmed) return null
  return parseComparison(trimmed) ?? parseRange(trimmed) ?? parseText(trimmed)
}

/**
 * 기준 문자열 하나를 중간표현으로 바꾼다. 해석하지 못하면 `null`.
 *
 * `null`은 오류가 아니라 "이 기준으로는 판정할 수 없다"는 답이다. 호출 측은
 * 그 구간을 건너뛰고, 어디에도 걸리지 않으면 판정불가가 된다.
 */
export function parseReference(input: string): Criterion | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  // 혈압: `이며`(AND) / `또는`(OR)이 있으면 '/'는 수축기/이완기 구분이다.
  const op = trimmed.includes('이며') ? 'and' : trimmed.includes('또는') ? 'or' : null
  if (op) {
    const [left, right] = trimmed.replace(/이며|또는/g, '').split('/')
    if (right === undefined) return null
    const systolic = parseAtom(left)
    const diastolic = parseAtom(right)
    return systolic && diastolic ? { kind: 'bloodPressure', systolic, diastolic, op } : null
  }

  const parts = trimmed.split('/').map((s) => s.trim())

  // 성별 분기: 각 항이 남/여 접두를 갖는다.
  if (parts.every((part) => SEX_PREFIX.test(part))) {
    const bySex = { male: null as Criterion | null, female: null as Criterion | null }
    for (const part of parts) {
      const label = SEX_PREFIX.exec(part)![1]
      const criterion = parseAtom(part.replace(SEX_PREFIX, ''))
      if (label === '남') bySex.male = criterion
      else bySex.female = criterion
    }
    return bySex.male && bySex.female
      ? { kind: 'bySex', male: bySex.male, female: bySex.female }
      : null
  }

  if (parts.length === 1) return parseAtom(parts[0])

  // 남은 '/'는 불연속 구간의 합집합이다 (BMI 정상B).
  const of = parts.map(parseAtom)
  return of.every((c) => c !== null) ? { kind: 'union', of: of as Criterion[] } : null
}
