import type { ComponentType } from 'react'

import { Card } from './Card'

interface ErrorScreenProps {
  /** 무슨 일이 일어났는지. 원인이 아니라 사용자가 겪은 사실을 말한다. */
  title: string
  description: string
  /** 상태코드나 라우트처럼 문의할 때 필요한 식별자. 없으면 안 그린다. */
  detail?: string
  /** 아이콘은 **타입**으로 받는다. 만들어진 엘리먼트를 내리지 않는다. */
  icon: ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  /** 이 화면에서 나가는 길. 막다른 길로 두지 않는다. */
  actions?: React.ReactNode
}

/**
 * 막다른 화면 하나. 404·런타임 오류가 같은 껍데기를 쓴다 —
 * 사용자에게는 "여기서 더 못 간다"는 같은 사실이고, 다르게 생기면
 * 둘 다 처음 보는 화면이 된다.
 *
 * 도메인을 모른다. 무엇이 실패했는지는 호출부가 문장으로 넘긴다.
 *
 * `role="alert"`을 쓰지 않는다 — 이건 끼어드는 알림이 아니라 화면 전체이고,
 * 제목이 `h1`이라 스크린 리더가 이동하면서 이미 읽는다.
 */
export function ErrorScreen({
  title,
  description,
  detail,
  icon: Icon,
  actions,
}: ErrorScreenProps) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-10">
      <Card className="p-6 text-center">
        <Icon aria-hidden className="mx-auto size-8 text-slate-400" />

        <h1 className="mt-4 text-lg font-semibold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>

        {detail && (
          <p className="mt-3 font-mono text-xs break-all text-slate-400">{detail}</p>
        )}

        {actions && <div className="mt-6 flex flex-col gap-2">{actions}</div>}
      </Card>
    </main>
  )
}
