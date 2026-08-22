/**
 * CANDiY 검진 조회 프록시.
 *
 * 두 가지를 동시에 푼다:
 * 1. **CORS** — `api.candiy.io`는 CORS 헤더를 주지 않는다(OPTIONS → 403).
 *    브라우저가 직접 부를 수 없어서 서버를 거치는 것 외에 방법이 없다.
 * 2. **키 노출** — `API_KEY`에 `VITE_` 접두사가 없어 번들에 들어가지 않는다.
 *    키는 이 함수의 `process.env`에만 있다.
 *
 * 1차·2차를 나누지 않는다. 차이는 바디의 필드 두 개(`isContinue`,
 * `multiFactorInfo`)뿐이고 그건 클라이언트가 만든다 — 여기서 구분하면
 * 같은 프록시 로직이 두 벌이 된다.
 */
const ENDPOINT = 'https://api.candiy.io/v1/nhis/checkup'

/** 1차·2차 모두에 있어야 하는 필드. 없으면 CANDiY까지 가지 않는다. */
const REQUIRED = ['id', 'legalName', 'birthdate', 'phoneNo', 'telecom']

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })

export default {
  async fetch(request: Request) {
    if (request.method !== 'POST') {
      return json({ status: 'error', message: 'POST만 허용한다' }, 405)
    }

    const apiKey = process.env.API_KEY
    if (!apiKey) {
      // 클라이언트가 "설정되지 않았습니다" 카피를 고를 수 있어야 한다.
      return json({ status: 'error', code: 'NO_API_KEY' }, 503)
    }

    // 인증 없이 공개된 엔드포인트다. 검증을 안 하면 남의 API 키로
    // 임의 요청을 대신 쏴주는 오픈 프록시가 된다.
    const raw = await request.text()
    let body: Record<string, unknown>
    try {
      body = JSON.parse(raw)
    } catch {
      return json({ status: 'error', message: '요청 형식이 올바르지 않다' }, 400)
    }

    const missing = REQUIRED.filter((key) => typeof body[key] !== 'string' || !body[key])
    if (missing.length > 0) {
      // 어느 필드인지만 알린다. 값은 개인정보라 응답에도 로그에도 남기지 않는다.
      return json({ status: 'error', message: `필수 항목이 없다: ${missing.join(', ')}` }, 400)
    }

    const upstream = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'Content-Type': 'application/json' },
      // 파싱한 것이 아니라 원문을 보낸다 — `multiFactorInfo`는 1차 응답의
      // `.data`를 통째로 되돌려줘야 하고, 재직렬화는 그 계약을 깨뜨릴 수 있다.
      body: raw,
    })

    // 상태와 바디를 그대로 넘긴다. 여기서 해석하면 응답 형태를 두 곳에서 알아야 한다.
    return new Response(await upstream.text(), {
      status: upstream.status,
      headers: { 'Content-Type': 'application/json' },
    })
  },
}
