import { defineConfig, mergeConfig } from 'vitest/config'

import viteConfig from './vite.config.ts'

// 라우터 플러그인이 테스트 실행 중 라우트 트리를 재생성하지 않도록 vite 설정에서 분리했다.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      include: ['src/**/*.test.{ts,tsx}'],
    },
  }),
)
