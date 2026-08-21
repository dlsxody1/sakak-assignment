import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

import { LAYERS, layerRank, type Layer } from './fsd'

// ESLint 경계 플러그인 대신 테스트로 검사한다. 규칙이 10줄이면 표현되고,
// 위반 메시지를 우리가 원하는 형태로 낼 수 있으며, pnpm test에 그대로 붙는다.
const SRC = join(import.meta.dirname, '..', '..')

/** src 아래 모든 .ts/.tsx 파일 경로 */
function collectSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return collectSourceFiles(path)
    return /\.tsx?$/.test(name) ? [path] : []
  })
}

/**
 * `import ... from '@/...'` 의 경로만 뽑는다. 상대경로는 슬라이스 내부라 검사 대상이 아니다.
 *
 * 따옴표 두 종류를 모두 본다. 이 레포엔 포매터가 없어서 작은따옴표만 매칭하면
 * 큰따옴표로 쓴 import가 경계 검사를 통째로 빠져나간다.
 */
function collectAliasImports(source: string): string[] {
  return [...source.matchAll(/from\s+['"](@\/[^'"]+)['"]/g)].map((m) => m[1])
}

interface Location {
  layer: Layer
  /** entities/checkup 의 'checkup'. shared·app 처럼 슬라이스가 없으면 undefined */
  slice?: string
}

function locate(segments: string[]): Location | undefined {
  const [layer, slice] = segments
  if (!LAYERS.includes(layer as Layer)) return undefined
  return { layer: layer as Layer, slice }
}

const files = collectSourceFiles(SRC).map((path) => ({
  path,
  rel: relative(SRC, path),
  location: locate(relative(SRC, path).split(sep)),
  imports: collectAliasImports(readFileSync(path, 'utf8')),
}))

describe('FSD 레이어 경계', () => {
  it('src 하위 최상위 디렉터리는 FSD 레이어 이름만 사용한다', () => {
    // main.tsx만 레이어 밖에 두고(번들러 진입점 관례), 나머지는 전부 레이어에 속한다.
    const unknown = readdirSync(SRC)
      .filter((name) => statSync(join(SRC, name)).isDirectory())
      .filter((name) => !LAYERS.includes(name as Layer))

    expect(unknown, `알 수 없는 레이어: ${unknown.join(', ')}`).toEqual([])
  })

  it('상위 레이어만 하위 레이어를 참조한다', () => {
    const violations = files.flatMap(({ rel, location, imports }) => {
      if (!location) return []
      return imports.flatMap((spec) => {
        const target = locate(spec.replace('@/', '').split('/'))
        if (!target) return []
        // 같은 레이어 참조는 슬라이스 규칙에서 따로 검사한다.
        if (layerRank(target.layer) > layerRank(location.layer)) return []
        if (target.layer === location.layer) return []
        return [`${rel} → ${spec} (${location.layer}가 상위 레이어 ${target.layer}를 참조)`]
      })
    })

    expect(violations, violations.join('\n')).toEqual([])
  })

  it('같은 레이어의 다른 슬라이스를 참조하지 않는다', () => {
    const violations = files.flatMap(({ rel, location, imports }) => {
      if (!location?.slice) return []
      return imports.flatMap((spec) => {
        const target = locate(spec.replace('@/', '').split('/'))
        if (target?.layer !== location.layer) return []
        if (!target.slice || target.slice === location.slice) return []
        return [`${rel} → ${spec} (${location.layer} 내 슬라이스 간 직접 참조)`]
      })
    })

    expect(violations, violations.join('\n')).toEqual([])
  })

  it('슬라이스 내부 경로를 건너뛰고 공개 API로만 참조한다', () => {
    // 허용: @/entities/checkup      (공개 API)
    // 금지: @/entities/checkup/model/checkup-store
    const violations = files.flatMap(({ rel, location, imports }) => {
      if (!location) return []
      return imports.flatMap((spec) => {
        const segments = spec.replace('@/', '').split('/')
        const target = locate(segments)
        if (!target?.slice || target.layer === location.layer) return []
        // shared는 배럴을 두지 않고 세그먼트 단위로 직접 import한다.
        if (target.layer === 'shared') return []
        return segments.length > 2
          ? [`${rel} → ${spec} (슬라이스 내부 직접 참조, 공개 API를 사용할 것)`]
          : []
      })
    })

    expect(violations, violations.join('\n')).toEqual([])
  })

  it('판정 도메인은 다른 슬라이스에 의존하지 않는다', () => {
    // health-reference는 React·API·checkup을 모르는 순수 도메인이어야
    // fixture 없이도 단위 테스트가 가능하다.
    const violations = files
      .filter(({ location }) => location?.slice === 'health-reference')
      .flatMap(({ rel, imports }) =>
        imports
          .filter((spec) => !spec.startsWith('@/shared/'))
          .map((spec) => `${rel} → ${spec}`),
      )

    expect(violations, violations.join('\n')).toEqual([])
  })
})
