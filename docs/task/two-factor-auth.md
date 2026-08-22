# 2단계 인증 연동 (`features/checkup-inquiry`)

평가 기준 **"API 연동 정확성"의 핵심**이다. 지금은 fixture만 읽고 실 API를 부르지 않는다.

검증된 출처는 [probe-candiy.sh](../../dashboard/scripts/probe-candiy.sh) —
실제로 호출해서 확인한 것이다. 추측으로 만들지 말고 이 스크립트를 그대로 옮긴다.

## 흐름

```
① 로그인 폼 (이름·생년월일·전화·통신사·성별)
      ↓  1차 요청  inquiryType:"0"  loginTypeLevel:"8"(토스)
② 응답 .data 를 통째로 보관
      ↓
③ 인증 대기 화면 — 사용자가 토스 앱에서 인증 (제한 4분 30초)
      ↓  2차 요청  isContinue:"1" + multiFactorInfo:<1차 .data>
④ 검진 결과 → 기존 대시보드로
```

## 요청 형태

`POST https://api.candiy.io/v1/nhis/checkup`, 헤더 `x-api-key`

**1차**
```json
{ "id": "...", "loginTypeLevel": "8", "legalName": "...", "birthdate": "...",
  "phoneNo": "...", "telecom": "0", "startDate": "...", "endDate": "...",
  "inquiryType": "0" }
```

**2차** — 1차 바디에 두 개만 더한다
```json
{ ...(1차와 동일), "isContinue": "1", "multiFactorInfo": <1차 응답의 .data 통째로> }
```

`telecom`: `0`=SKT · `1`=KT · `2`=LGU+

## 걸리는 것

- **`multiFactorInfo`는 1차 응답의 `.data`를 통째로** 넣는다. 일부 필드만 골라 넣으면 안 된다.
- **4분 30초 제한.** 넘기면 1차부터 다시다. 남은 시간을 화면에 보여줘야 한다.
- ~~**`API_KEY`가 브라우저에 노출된다.**~~ **해결됨 — 트레이드오프가 아니었다.**
  `api.candiy.io`는 **CORS 헤더를 주지 않는다**(확인함: `OPTIONS` → 403,
  `access-control-*` 0개). 브라우저에서 직접 부를 수 없어 서버리스 프록시가
  **유일한 동작 경로**다. "실무라면 BFF, 과제 범위 밖"이라고 적었던 전제가 틀렸고,
  프록시를 두면 키 노출 문제도 함께 사라진다.
- 실패하면 fixture로 폴백한다. 평가자가 API 키 없이도 화면을 볼 수 있어야 한다.
  → **캐시를 덮어쓰지 않는 것이 곧 폴백이다.** 폴백 코드가 따로 없다.

## UX 미설계

[docs/ux/screens/dashboard.md](../ux/screens/dashboard.md)의 `미해결`에 적힌 그대로,
**대기 상태 UX가 설계되지 않았다.** 구현 전에 UX부터 정한다 (CLAUDE.md: UX 먼저).

정해야 할 것:

| 상태 | 화면에 뭐가 있어야 하나 |
| --- | --- |
| 폼 입력 | 어떤 필드, 어떤 검증, 통신사·성별은 어떤 컨트롤 |
| 1차 요청 중 | 로딩 표현 |
| **인증 대기** | 남은 시간(4:30 카운트다운), "토스 앱에서 인증하세요" 안내, 취소 |
| 시간 초과 | 무슨 문구, 어디로 되돌리나 |
| 인증 실패 | 원인 + 다음 행동 |
| 성공 | 대시보드로 전환 |

## 구조

```
features/checkup-inquiry/
├── api/     1차·2차 요청 fetcher
├── model/   인증 단계 상태 (zustand — 공유 상태이고 서버 상태가 아니다)
│            남은 시간 타이머 훅
├── lib/     폼 검증 등 순수 함수
└── ui/      폼, 대기 화면
```

- 인증 단계(`idle → pending → waiting → done`)는 **zustand**다. 서버에서 온 게 아니다.
- 검진 결과는 **Query 캐시**가 단일 출처다. zustand에 복사하지 않는다.
- 성별은 이미 `entities/user` 세션에 있다 — 로그인 폼이 그 값을 채우면 되고
  소비하는 쪽(`useCheckupOverview`)은 안 바뀐다.

## 해야 할 일

- [x] UX 설계 → [`docs/ux/screens/auth.md`](../ux/screens/auth.md)
- [x] `features/checkup-inquiry` 구현
- [x] `API_KEY` 노출 — 프록시로 해소, README에 명시
- [x] 실 API 실패 시 fixture 폴백 (캐시를 안 덮는 것이 폴백)
- [x] 라우트 구조 — `/login` 별도 페이지. 앱 규약이 모달을 금지하고,
      대시보드는 `lg:h-dvh`로 높이가 고정돼 폼을 얹을 자리가 없다
- [x] `dashboard/README.md` 갱신

남은 것:

- [ ] 실패 원인별 카피 분기 — 실패 응답 형태를 확인한 뒤에 (추측으로 나누지 않는다)
- [ ] 2차 요청 폴링 여부 — 인증 완료 전 호출의 동작을 확인하면 버튼을 없앨 수 있다

## 커밋 단위

1. UX 문서
2. API 레이어 (1차·2차 요청)
3. 인증 상태·타이머 (model)
4. 폼·대기 화면 (ui)
