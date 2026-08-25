import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

/**
 * 개발 서버에서 `/api/checkup`을 태운다.
 *
 * `api/checkup.ts`는 Vercel 서버리스 함수라 배포 환경에서만 돈다 — `vite dev`는
 * 그걸 모르고 404를 준다. 함수를 그대로 불러 Node 요청/응답만 바꿔 끼운다.
 * 프록시 로직을 두 벌로 만들지 않는 게 요점이다.
 *
 * 개발 전용이다. 프로덕션에서는 Vercel이 같은 파일을 직접 실행한다.
 */
function apiDevServer(): Plugin {
  return {
    name: 'api-dev-server',
    apply: 'serve',
    configureServer(server) {
      // 함수가 읽는 자리는 process.env다. .env의 값을 거기에 채워준다.
      // `VITE_` 접두사가 없는 값이라 세 번째 인자로 접두사 필터를 비운다.
      const env = loadEnv(server.config.mode, process.cwd(), '')
      process.env.API_KEY ??= env.API_KEY

      server.middlewares.use('/api/checkup', async (req, res) => {
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)

        const headers = new Headers()
        for (const [key, value] of Object.entries(req.headers)) {
          if (typeof value === 'string') headers.set(key, value)
        }

        const { default: handler } = await server.ssrLoadModule('/api/checkup.ts')
        const response: Response = await handler.fetch(
          new Request(`http://localhost${req.url}`, {
            method: req.method,
            headers,
            body: chunks.length > 0 ? Buffer.concat(chunks) : undefined,
          }),
        )

        res.statusCode = response.status
        response.headers.forEach((value, key) => res.setHeader(key, value))
        res.end(await response.text())
      })
    },
  }
}

export default defineConfig({
  plugins: [
    apiDevServer(),
    // 라우트 정의는 FSD의 app 레이어에 속하므로 기본 위치(src/routes)에서 옮겼다.
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
      routesDirectory: './src/app/routes',
      generatedRouteTree: './src/app/routeTree.gen.ts',
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
