import type { Judgement } from '../model/types'

/**
 * 판정 5-state의 화면 표현. 색은 여기서만 정하고 위젯은 직접 고르지 않는다.
 *
 * 색 + 라벨 + 형태로 중복 부호화한다. `shape`는 색을 못 보는 사용자를 위한
 * 두 번째 채널이라, 색만 다르고 형태가 같으면 이 표는 실패한 것이다.
 * suspect를 순수 빨강이 아니라 주황 쪽으로 당겨 normalA와 명도까지 벌려 뒀다.
 */
export interface JudgementDisplay {
  label: string
  /** 배지 표면. soft 배경 + 진한 글자로 명암비를 확보한다. */
  badge: string
  /** 점·막대 등 색 면. */
  fill: string
  /** 차트 선·기준 밴드에 쓰는 원색. */
  chart: string
  /** 색 없이도 구분되는 형태 신호. */
  shape: string
}

export const JUDGEMENT_DISPLAY: Record<Judgement, JudgementDisplay> = {
  normalA: {
    label: '정상 A',
    badge: 'bg-normal-a-soft text-normal-a',
    fill: 'bg-normal-a',
    chart: 'var(--color-normal-a)',
    shape: '●',
  },
  normalB: {
    label: '정상 B',
    badge: 'bg-normal-b-soft text-normal-b',
    fill: 'bg-normal-b',
    chart: 'var(--color-normal-b)',
    shape: '◐',
  },
  suspect: {
    label: '질환의심',
    badge: 'bg-suspect-soft text-suspect',
    fill: 'bg-suspect',
    chart: 'var(--color-suspect)',
    shape: '▲',
  },
  unmeasured: {
    label: '미측정',
    badge: 'bg-unmeasured-soft text-unmeasured',
    fill: 'bg-unmeasured',
    chart: 'var(--color-unmeasured)',
    shape: '○',
  },
  undetermined: {
    label: '판정불가',
    badge: 'bg-undetermined-soft text-undetermined',
    fill: 'bg-undetermined',
    chart: 'var(--color-undetermined)',
    shape: '?',
  },
}

/** 나쁜 것부터. 요약 막대와 항목 정렬이 이 순서를 쓴다. */
export const JUDGEMENT_ORDER: Judgement[] = [
  'suspect',
  'undetermined',
  'normalB',
  'normalA',
  'unmeasured',
]
