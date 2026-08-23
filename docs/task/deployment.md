# 배포

평가자가 링크로 열어봐야 한다. 로컬에서 `pnpm dev`를 시키는 것보다 낫다.

## 지금 상태

`dashboard/vercel.json`이 이미 있다 (SPA fallback rewrite). **커밋되지 않았다** —
배포를 결정할 때 같이 커밋한다.

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

TanStack Router가 클라이언트 라우팅이라 이 rewrite가 없으면 `/` 외의 경로에서 404가 난다.

## 결정할 것

| 방식 | 장점 | 단점 |
| --- | --- | --- |
| **Vercel** | 설정 파일이 이미 있다. 링크 하나로 끝 | 계정 필요 |
| **Dockerfile** | 평가자가 로컬에서 재현 가능. 인프라 이해를 보임 | 빌드·실행 절차가 늘어난다 |
| 둘 다 | 링크 + 재현성 | 관리 지점 2개 |

> 과제 평가에는 **Vercel이 실용적**이다. 링크를 열면 바로 보인다.
> Dockerfile은 여력이 남으면 추가한다.

## 걸리는 것

- **`API_KEY`.** 2단계 인증을 붙이면 키가 필요하다. Vercel 환경변수에 넣더라도
  `VITE_` 접두사면 번들에 박혀 공개된다 — [two-factor-auth.md](two-factor-auth.md)의
  같은 문제다. 배포 전에 결정한다.
- 키 없이 열어도 **fixture로 화면이 보여야 한다.** 평가자가 키를 안 가졌을 수 있다.
- 빌드 경고: ApexCharts가 라우트 청크에 약 970 kB를 더한다.
  동작에 문제는 없지만 신경 쓰이면 동적 import로 쪼갠다.

## 해야 할 일

- [x] 배포 방식 결정 — Vercel. Root Directory `dashboard`
- [x] `vercel.json` 커밋 (+ `functions.maxDuration`)
- [x] 환경변수 설정 — `API_KEY`, `VITE_` 접두사 없이 서버에서만
- [x] 배포 후 동작 확인 — 아래
- [x] 루트 README에 링크 추가

배포: **https://dashboard-alpha-ten-71.vercel.app**

확인한 것:

| 검증 | 결과 |
| --- | --- |
| `/` 가 예시 데이터로 열린다 | 200 |
| `/login` 새로고침 404 안 남 (rewrite) | 200 |
| `/api/checkup`이 `index.html`이 아니라 JSON | `{"status":"error","code":"NO_API_KEY"}` → 키 설정 후 정상 |
| 프록시가 CANDiY까지 실제로 도달 | 1차 요청에 `status:"success"` + `transactionId` 수신 |
| 번들에 키 없음 | `dist/assets/*.js` grep 0건, 배포본도 0건 |
| 인증 대기 화면 | 실 응답으로 4분 30초 카운트다운 동작 |

**남은 것**: 실제 토스 인증 1회 통과 (본인 실명·생년월일·휴대폰이 필요해 미검증).
