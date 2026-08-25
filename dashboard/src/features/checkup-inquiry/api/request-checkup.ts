import type { CheckupResponse } from '@/entities/checkup'

import { NETWORK_MESSAGE, messageForStatus } from '../lib/error-message'

/**
 * 검진 조회 요청.
 *
 * CANDiY를 직접 부르지 않고 `/api/checkup` 프록시를 거친다 —
 * CANDiY가 CORS 헤더를 주지 않아 브라우저에서 직접 못 부르고,
 * 프록시가 서버에서 `x-api-key`를 붙여 키가 번들에 박히지 않는다.
 */
const PROXY = '/api/checkup'

/** 키가 없는 배포본. 화면이 "설정되지 않았습니다" 카피를 고를 수 있어야 한다. */
export class ApiKeyMissingError extends Error {}

async function post(body: object): Promise<CheckupResponse> {
  let response: Response
  try {
    response = await fetch(PROXY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    // `fetch`는 상태코드가 아니라 **연결 자체**가 실패했을 때만 reject한다
    // (오프라인·DNS·중단). 응답이 없으니 상태코드로 분기할 수 없다.
    throw new Error(NETWORK_MESSAGE)
  }

  const payload = await response.json().catch(() => null)

  if (payload?.code === 'NO_API_KEY') {
    throw new ApiKeyMissingError('검진 조회 서비스가 설정되지 않았습니다.')
  }

  if (!response.ok || payload?.status !== 'success') {
    // API 원문 메시지를 그대로 노출하지 않는다(카피 규칙). 대신 상태코드로
    // 갈라 **다음에 뭘 할지**를 말한다 — 재시도할 일과 입력을 고칠 일이 다르다.
    //
    // 상태가 200인데 `status !== 'success'`인 경우가 있다. 그때는 상태코드가
    // 원인을 말해주지 않으므로 200을 그대로 넘겨 기본 문장을 받는다.
    throw new Error(messageForStatus(response.status))
  }

  return payload as CheckupResponse
}

/** 1차 — 인증 요청. 응답의 `.data`가 2차의 `multiFactorInfo`가 된다. */
export const requestAuth = (body: object) => post(body)

/**
 * 2차 — 앱 인증을 마친 뒤. 1차 바디에 두 필드만 더한다.
 *
 * `multiFactorInfo`는 1차 응답의 `.data`를 **통째로** 넣는다.
 * 일부 필드만 골라 넣으면 실패한다.
 */
export const requestResult = (body: object, multiFactorInfo: unknown) =>
  post({ ...body, isContinue: '1', multiFactorInfo })
