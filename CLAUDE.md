# sakak 프론트엔드 기술 과제

기업 과제다. 평가 기준이 **코드베이스 구조 · API 연동 정확성 · UI 설계 · 문서화 · 커밋 단위**이므로,
동작하는 것만큼 어떻게 구성했는지가 점수다.

독립 패키지 2개. 모노레포 툴은 쓰지 않는다 — 명령은 각 패키지 디렉터리 안에서 실행한다.

| 패키지 | 내용 |
| --- | --- |
| [`algorithm/`](algorithm) | 개미수열 n번째 항의 가운데 두 자리 |
| [`dashboard/`](dashboard) | CANDiY API 연동 건강검진 대시보드 |

## 개발 명령

`dashboard/`: `pnpm dev` · `pnpm build` · `pnpm test` · `pnpm lint`(oxlint)
`algorithm/`: `pnpm test` · `pnpm test:bench`

- **포매터가 없다.** 주변 코드 스타일(작은따옴표, 세미콜론 없음)을 따른다.
  `app/routes/index.tsx`가 이미 어긋나 있으니 기준으로 삼지 말 것.
- pre-commit 훅은 `dashboard/src/` 변경 시 경계 테스트만 돌린다. 전체 테스트는 수동으로.

## FSD 레이어

규칙의 단일 출처는 [fsd.ts](dashboard/src/shared/config/fsd.ts)이고, 검증은
[fsd-boundaries.test.ts](dashboard/src/shared/config/fsd-boundaries.test.ts)가 한다.
**규칙 본문을 여기 복제하지 않는다** — 두 곳에 적으면 어긋난다.

| 레이어 | 정의 | 이 과제에서 |
| --- | --- | --- |
| `app` | 초기화·프로바이더·라우팅. 비즈니스 로직 없음 | `routes/`, `styles/` |
| `pages` | 라우트 하나 = 페이지 하나. 위젯 조립만 | 대시보드, 이력 리스트, 로그인 |
| `widgets` | 여러 엔티티·기능을 묶은 화면 블록 | 요약 카드 그룹, 추이 차트, 이력 테이블 |
| `features` | 사용자가 하는 행위 하나 | 건강검진 조회(2단계 인증), 로그인 |
| `entities` | 비즈니스 개념과 그 데이터·판정 로직 | `checkup`, `health-reference`, `user` |
| `shared` | 도메인을 모르는 재사용 코드 | API 클라이언트, UI 프리미티브, fixture |

배치 기준: **"이게 뭐냐"면 `entities`, "뭘 한다"면 `features`, "화면 한 덩어리"면 `widgets`.**

### 경계 테스트가 통과해도 FSD를 지킨 게 아니다

테스트는 **잘못된 방향의 import만** 잡는다. 전부 한 레이어에 몰아넣은 것은 못 잡는다.
`widgets`가 비대해지고 `entities/*/ui`와 `features`가 비어 있으면 배치를 안 한 것이다.

- **`entities/*/ui`** — 도메인 개념 **하나**를 그리는 컴포넌트는 엔티티가 갖는다.
  판정 배지, 검사 항목 행이 여기다. 위젯에 두지 않는다.
- **`features/`** — 사용자 행위 하나. 항목 선택·펼치기·조회가 여기다.
  이 폴더가 비어 있으면 행위를 전부 위젯에 박았다는 신호다.
- **`widgets/`** — **조립만** 한다. 위젯 파일에 계산과 표현이 다 들어 있으면
  그건 위젯이 아니라 페이지 덩어리다.

파일을 만들기 전에 묻는다: 엔티티 하나를 그리나 → `entities/ui`.
사용자가 하는 행위인가 → `features`. 여러 개를 조립하나 → `widgets`.

알아두면 헷갈리지 않는 것:
- `shared`만 배럴 없이 세그먼트 단위로 직접 import한다 (경계 테스트의 명시적 예외)
- `main.tsx`는 번들러 진입점이라 레이어 밖에 둔다
- 라우트가 `src/routes`가 아니라 `src/app/routes`인 것은 FSD에 맞추려고 옮긴 것이다

## 세그먼트 규약

FSD는 파일이 **어느 레이어**에 갈지만 정한다. 슬라이스 안에서 어떻게 쓰는지는 아래가 정한다.
`ui`/`lib` 규약은 경계 테스트의 `세그먼트 규약` describe가 강제한다.

- **`ui/`** — props로 데이터만 받는 프레젠테이션. 상태·부수효과 훅과 `fetch` 직접 호출 금지.
  예외: `isHovered` `isOpen` 애니메이션처럼 그 컴포넌트만 쓰는 로컬 상태는 `useState`로 여기 둔다.
- **`model/`** — 비즈니스 상태, 폼 상태, API 연동 훅. **훅 하나 = 관심사 하나** (거대한 `useEffect` 금지).
- **`api/`** — fetcher와 react-query의 `queryKey`/`queryFn`.
- **`lib/`** — React를 import하지 않는 순수 함수. 파싱·판정·포맷·변환이 전부 여기.

**작성 순서**: ① props 타입 → ② `model/` 훅 시그니처 → ③ `ui` 컴포넌트.
`ui`는 항상 마지막이다. 이미 정해진 타입에 맞춰서만 쓴다.

### 훅과 순수 함수를 분리한다

순수 함수는 렌더링·`act()`·mock 없이 입출력만으로 테스트된다. 훅 안에 로직이 들어가면
그 로직을 검증하려고 렌더링 환경을 세워야 한다.

- 훅을 호출하지 않는다 → `lib/`의 순수 함수
- 훅 호출이 필요하다 → `model/`의 `useXxx`, 로직은 `lib/`을 불러서 쓴다
- **"훅 안에서 계산하는 20줄"이 보이면 `lib/`로 뺀다**
- **컴포넌트 안의 `reduce`·`map` 가공도 마찬가지다.** 그룹핑·집계는 UI가 아니라 로직이다.
  `ui`에 3줄 넘는 계산이 보이면 `lib/`로 빼고 테스트를 붙인다.

### 타입은 재사용 여부로 자리가 갈린다

- **그 컴포넌트만 쓰는 props 타입** → 그 파일 안에 선언한다. 별도 파일로 빼지 않는다.
- **둘 이상이 쓰는 타입** → `model/types.ts`로 뺀다.
  컴포넌트 파일에서 타입을 import해오는 구조가 되면 자리를 잘못 잡은 것이다.

### 상태는 성격에 따라 자리가 정해진다

| 종류 | 도구 | 위치 | 예 |
| --- | --- | --- | --- |
| 서버 상태 | TanStack Query | `api/` + `model/` | 검진 조회 결과 |
| 공유 상태 | zustand | `model/` | 인증 세션, 인증 플로우 단계 |
| 로컬 UI 상태 | `useState` | `ui/` | `isHovered`, 애니메이션 |

- **서버에서 온 것을 zustand에 복사하지 않는다.** Query 캐시가 단일 출처다.
- **로컬 UI 상태를 zustand로 올리지 않는다.** `isHovered`가 전역에 있으면 그 컴포넌트는
  단독으로 재사용할 수 없게 되고 스토어만 비대해진다.

### 도메인 콜백을 props로 내려주지 않는다

```tsx
// ❌ ui에 상태 + fetch가 섞이고, 부모가 콜백을 내려준다
function UserCard({ userId, onUpdate }: { userId: string; onUpdate: (id: string) => void }) {
  const [user, setUser] = useState(null)
  useEffect(() => { fetchUser(userId).then(setUser) }, [userId])
  ...
}

// ✅ model이 상태를, ui가 표현을 맡는다
// model/useUser.ts
export function useUser(userId: string) {
  return useQuery({ queryKey: ['user', userId], queryFn: () => fetchUser(userId) })
}
// ui/UserCard.tsx — props는 데이터만
export function UserCard({ user, isLoading }: UserCardProps) {
  if (isLoading) return <Skeleton />
  return <div>{user.name}</div>
}
```

이유 셋:
1. **숨은 계약** — `onUpdate`는 이름과 시그니처만으로 *언제* 불리는지 알려주지 않는다.
   `UserCard`를 고치는 사람이 부모 코드를 읽어야만 안다.
2. **예측 가능성** — `(id: string) => void`는 타입일 뿐 동작이 아니다. 실제 사이드 이펙트가
   컴포넌트 바깥에 있어서 파일 하나만 읽어서는 뭘 하는지 알 수 없다.
3. **리렌더링** — 매 렌더마다 새 함수라 참조 동등성이 깨진다. `memo`·`useCallback`으로
   덧대기 시작하면 그때부터 관리 비용이 붙는다.

핸들러가 필요한 컴포넌트가 `model/` 훅에서 직접 받는다. props로는 **데이터만** 흐른다.
이러면 prop drilling도 같이 사라진다.

예외는 `shared/ui`의 도메인 없는 프리미티브(`<Button onClick>`) — DOM 이벤트 위임일 뿐이다.
금지 대상은 도메인 의미를 가진 콜백(`onCheckupSelect`, `onAuthComplete`)이다.

### 아이콘과 엘리먼트를 props로 내려주지 않는다

- **아이콘은 `react-icons`를 쓴다.** `<svg>`를 직접 선언하지 않는다.
  예외는 데이터로 그리는 것(스파크라인·차트) — 그건 아이콘이 아니라 시각화다.
- **만들어진 엘리먼트(`ReactNode`)를 내려주지 않는다.** `badge={<Badge .../>}` 처럼 넘기면
  부모가 자식의 내부 구조를 알아야 하고, 자식은 그걸 어디에 놓을지만 정하는 껍데기가 된다.
  컴포넌트 **타입**(`ComponentType`)을 받아 자식이 직접 그린다.

## 판정 도메인 (`entities/health-reference`)

이 과제의 실질적 난이도. `@/shared/` 외에는 아무것도 import하지 않는 **순수 도메인**이어야 한다
(경계 테스트가 강제). React·API·`checkup`을 몰라야 fixture 없이 단위 테스트가 된다.

`referenceList`는 판정 기준을 **자연어 문자열**로 준다. 파서가 다뤄야 할 형태:

| 형태 | 예 |
| --- | --- |
| 범위 | `18.5-24.9`, `41-50`, `25~29.9` |
| 부등호 | `100미만`, `60이상`, `1.6이하`, `1.6초과` |
| 성별 분기 | `남: 13-16.5 / 여: 12-15.5`, `남:11-63 / 여:8-35` (콜론 뒤 공백이 항목마다 다르다) |
| 혈압 복합 | `120미만 이며/80미만`(AND), `140이상 또는 /90이상`(OR) — 수축기/이완기 |
| 다중 구간 | `18.5미만/25~29.9` |
| 범주형 | `음성`, `정상, 비활동성`, `T-score -1 이상` |

### 판정 결과는 3색으로 떨어지지 않는다

과제 요구사항은 초록/주황/빨강 3색이지만 **데이터가 3색으로 안 나뉜다.** `refType` 4종
(단위/정상A/정상B/질환의심)에 실제 값을 맞춰보면 두 경우가 더 생긴다:

- **미측정** — 값이 빈 문자열
- **판정불가** — 어느 구간에도 걸리지 않음

이 둘을 "정상"이나 "위험"으로 뭉개지 않는다. 건강 데이터에서 *모르는 것*을 *괜찮은 것*으로
표시하는 건 사실과 다르다. 이름은 구현 시 정하되 **5-state를 유지**한다.

fixture가 이 경우들을 의도적으로 심어놨다. 파서 테스트의 회귀 기준이다:

| 검진일 | 값 | 왜 |
| --- | --- | --- |
| 2022 | `LDL=148` | 정상B `130-139`와 질환의심 `160이상` 사이 **구간 공백** → 판정불가 |
| 2024 | `Hb=16.8` | 남 정상A 상한 `16.5` 초과, 어느 구간에도 없음 → 판정불가 |
| 2025 | `BP=142/88` | `140이상 또는 /90이상`의 **OR에서 수축기만** 걸림 |
| 2021·2023 | `LDL=""`, `총콜=""` | 콜레스테롤 4종 결측 → 미측정 |
| 전 회차 | `osteoporosis=""` | 6회차 전부 결측 |

**성별 정보가 API 응답에 없다.** 성별 분기 기준을 가진 항목(`hemoglobin` `yGPT` `waist`)은
성별을 어딘가에서 받아야 한다 — 해결책은 미정.

## CANDiY API

검증된 출처는 [probe-candiy.sh](dashboard/scripts/probe-candiy.sh)다. 실제로 호출해서 확인한 것.

`POST https://api.candiy.io/v1/nhis/checkup`, 헤더 `x-api-key`.

**2단계 인증** — API 연동 평가의 핵심이다:
1. 1차 요청 (`inquiryType:"0"`, `loginTypeLevel:"8"`=토스)
2. 응답의 `.data`를 **통째로** 보관
3. 사용자가 앱에서 인증 (제한 4분 30초)
4. 2차 요청에 `isContinue:"1"` + `multiFactorInfo:<1차 .data>` 를 실어 보냄

### 응답에서 걸리는 것

- **스칼라가 전부 string이다.** 빈 문자열이 결측. `caseType`만 number.
- 문서와 실제가 다르다 — `caseType`은 문서상 String이지만 Number로 온다.
  `infantsCheckupList`·`infantsDentalList`는 문서에 없지만 빈 배열로 온다.
- **정렬을 가정하지 말 것** — `overviewList`는 오래된 순, `resultList`는 최신순이다.
  `resultList`는 날짜당 일반/구강 2건씩 온다.

### fixture

[checkup-response.json](dashboard/src/shared/api/__fixtures__/checkup-response.json)은
**개발·테스트용**이다. 프로덕션 경로는 실 API를 쓰고 fixture로 폴백한다.

- fixture를 손으로 고치지 않는다. [gen-fixture.mjs](dashboard/scripts/gen-fixture.mjs)를 고친다.
- **`API_KEY`는 `.env`에만.** 커밋 금지.
- fixture에 개인정보를 넣지 않는다 (probe가 이름·PDF를 마스킹하지만 `organizationName`은 남는다).

## 브랜치와 PR

**작업은 `dev`에서 한다. `main`에는 직접 커밋하지 않고 PR로만 들어간다.**

`dashboard/src/`를 건드린 PR은 **`dashboard/README.md`를 같은 PR에서 갱신한다.**
기능이 늘었는데 문서가 그대로면 그 PR은 완결되지 않은 것이다.

루트 README는 두 패키지로 가는 **링크 허브**로 유지한다. 상세는 각 패키지 README가 갖고
루트는 진입점 역할만 한다 — 같은 내용을 두 곳에 복제하지 않는다.

## 커밋

형식은 [.gitmessage](.gitmessage)와 [.githooks/commit-msg](.githooks/commit-msg)가 강제한다
(`core.hooksPath=.githooks` 설정 완료. clone 직후라면 `git config core.hooksPath .githooks`).

훅이 못 잡는 것:

- **커밋의 단위는 관심사다.** 되돌릴 수 있는 단위가 아니라 관심사가 기준이다.
  기능 하나를 바꿨으면 그 기능 하나가 한 커밋. 관심사가 둘이면 같이 되돌려도 되는 사이라도 나눈다.
  - 파서를 고치면서 그 김에 스타일을 정리했다 → 커밋 2개
  - 한 기능을 위해 3개 파일을 고쳤다 → 커밋 1개
  - "리팩터링과 기능 추가를 섞지 않는다"는 이 원칙의 사례일 뿐 별도 규칙이 아니다
- 제목은 **무엇을 왜** 바꿨는지 말한다. 한 문장에 안 담기면 커밋이 크다는 신호다 —
  제목을 늘리지 말고 커밋을 쪼갠다.
- 제목 60자 제한은 **문자 수** 기준이다 (한글 포함).

## 디자인 설계

**화면을 설계할 때는 두 스킬을 모두 거친다.** 선택이 아니다.
평가 기준에 "UI 설계 — 대시보드 구조, 시각화의 적절성, 반응형, 로딩/에러 상태 처리"가 있다.

| 축 | 담당 | 무엇을 정하나 |
| --- | --- | --- |
| **UX** | [`ux-design-kr`](.claude/skills/ux-design-kr) + [docs/ux/](docs/ux) | 정보 구조, 화면 상태, 인터랙션, 카피, 접근성 |
| **UI** | [`impeccable`](.claude/skills/impeccable) | 시각 위계, 색·타이포·여백, 모션, 토큰 |

순서는 **UX 먼저**다. 구조가 정해지기 전의 시각 결정은 되돌리게 된다.
[docs/ux/ux-design.md](docs/ux/ux-design.md)가 이미 정한 것은 다시 논의하지 않고,
바꿔야 하면 **그 문서를 먼저 고친다.**

### 둘이 부딪히면

좋은 화면은 두 축이 당기는 힘의 균형에서 나온다. 한쪽이 항상 이기면 그 축은 없는 것이다.
**충돌을 발견하면 숨기지 말고 드러내서 아래 기준으로 정한다.**

| 다툼 | 이기는 쪽 | 왜 |
| --- | --- | --- |
| 정보를 줄여 시각을 정돈 vs 다 보여주기 | **UX** | 건강 데이터에서 생략은 오독이다 |
| 가로 스크롤·잘림 | **UX** | 잘린 항목은 없는 항목이다 |
| 판정을 색으로만 vs 색+라벨+형태 | **UX** | 적록색맹에게 치명적이다 |
| 미측정·판정불가를 정상에 흡수 | **UX** | 제품 원칙 1을 깬다 |
| 여백·색·타이포·모션의 세부 | **UI** | UX 문서가 정할 영역이 아니다 |
| 같은 정보를 어떤 형태로 (막대 vs 도넛) | **UI** | 정보량이 같으면 시각 판단이다 |

UX가 이기는 항목이 많은 건 이 제품이 **정확성이 심미보다 앞서는 도메인**이기 때문이다
(impeccable 용어로 Operate 모드). 대신 그 제약 **안에서** 시각 완성도는 UI가 끝까지 민다 —
"UX가 이겼으니 대충"은 둘 다 진 것이다.

판정이 안 서면 **PRODUCT.md의 제품 원칙**이 최종 심판이다.

### 이미 판결난 다툼

아래 둘은 위 기준으로 이미 결론이 났다. 다시 꺼내지 않는다.

**가로 스크롤로 해결하지 않는다.** 보통 사람은 가로로 스크롤하지 않는다 —
잘린 항목은 없는 항목이다. `overflow-x-auto`를 쓰려는 순간 멈추고 세로 안에서 푼다:
`flex-wrap`으로 접거나, 개수를 줄이거나, 모바일에서 카드로 바꾼다.
페이드로 "스크롤 됨"을 알리는 것도 해결이 아니다.

**차트는 겹치면 안 된다.** 기준 구간 띠에 라벨을 얹을 때 데이터 선·마커와 겹치는지
실제 화면에서 확인한다. 띠가 촘촘하면 라벨을 띠 안에 넣지 말고 축 바깥이나 범례로 뺀다.

## 남은 작업

**[docs/task/](docs/task)에 있다.** 여기 목록을 복제하지 않는다 — 두 곳에 적으면 어긋난다.

가장 큰 것 둘: **`algorithm/`이 통째로 비어 있고**, 대시보드가 fixture만 읽는다
(2단계 인증 미연동 — 평가 기준 "API 연동 정확성"에 직접 걸린다).

정해진 것은 [docs/ux/](docs/ux)와 `PRODUCT.md`에 있다 — 차트는 ApexCharts,
판정 5-state 명명과 색 체계, 성별 입력 경로는 확정. 여기 다시 적지 않는다.
