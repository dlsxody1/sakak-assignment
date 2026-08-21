/**
 * FSD 레이어 규칙의 단일 출처.
 *
 * 상위 레이어는 하위 레이어만 import할 수 있고, 같은 레이어 안에서는
 * 다른 슬라이스를 직접 참조할 수 없다(공개 API인 슬라이스 루트만 허용).
 * 실제 검증은 fsd-boundaries.test.ts가 이 배열을 읽어서 수행한다.
 */
export const LAYERS = [
  'app',
  'pages',
  'widgets',
  'features',
  'entities',
  'shared',
] as const

export type Layer = (typeof LAYERS)[number]

/** 인덱스가 클수록 하위 레이어. app(0) → shared(5) */
export const layerRank = (layer: Layer) => LAYERS.indexOf(layer)
