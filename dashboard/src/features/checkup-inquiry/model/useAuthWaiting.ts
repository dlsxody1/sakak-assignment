import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { checkupKeys, normalizeCheckupResponse } from '@/entities/checkup'
import { requestResult } from '../api/request-checkup'
import { formatRemaining, isAnnounceTick } from '../lib/format-remaining'
import { AUTH_WINDOW_MS, useInquiry } from './inquiry-store'

const remainingOf = (deadline: number) => Math.max(0, deadline - Date.now())

/** 남은 시간이 이 아래로 떨어지면 표현을 강조한다. */
const URGENT_MS = 60_000

/**
 * 인증 대기. 남은 시간을 세고, 사용자가 인증을 마쳤다고 알리면 2차를 보낸다.
 *
 * **폴링하지 않는다.** 검증된 출처(`scripts/probe-candiy.sh`)가 사람의 입력을
 * 기다린 뒤 2차를 한 번 부르고, 인증 완료 전에 보내면 어떻게 되는지는
 * 확인되지 않았다 — 모르는 채로 반복 호출하면 인증 세션을 스스로 깨뜨릴 수 있다.
 */
export function useAuthWaiting() {
  const body = useInquiry((state) => state.body)
  const multiFactorInfo = useInquiry((state) => state.multiFactorInfo)
  const deadline = useInquiry((state) => state.deadline)
  const finish = useInquiry((state) => state.finish)
  const fail = useInquiry((state) => state.fail)
  const reset = useInquiry((state) => state.reset)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [remaining, setRemaining] = useState(() => remainingOf(deadline))
  // 마지막으로 읽어준 시각(초). 문장이 아니라 **어느 눈금이었는지**를 든다 —
  // 읽을 시각이 아닌 초에 빈 문자열로 비웠다가 다시 채우면 라이브 리전이
  // 그걸 새 알림으로 보고 매번 읽어서, 간격을 벌린 의미가 없어진다.
  const [announcedAt, setAnnouncedAt] = useState(0)

  // 남은 시간을 센다. 마감 시각에서 계산해야 탭이 백그라운드에 다녀와도 정확하다.
  useEffect(() => {
    const id = setInterval(() => {
      const next = remainingOf(deadline)
      setRemaining(next)
      if (isAnnounceTick(next)) setAnnouncedAt(Math.ceil(next / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [deadline])

  const announcement = announcedAt > 0 ? `남은 시간 ${formatRemaining(announcedAt * 1000)}` : ''

  const mutation = useMutation({
    mutationFn: () => requestResult(body ?? {}, multiFactorInfo),
    onSuccess: (response) => {
      // 서버 상태의 단일 출처는 Query 캐시다. 결과를 스토어에 복사하지 않는다.
      queryClient.setQueryData(checkupKeys.history(), normalizeCheckupResponse(response))
      finish()
      navigate({ to: '/' })
    },
    onError: (cause: Error) => fail(cause.message),
  })

  return {
    remaining,
    total: AUTH_WINDOW_MS,
    label: formatRemaining(remaining),
    announcement,
    isUrgent: remaining < URGENT_MS,
    isExpired: remaining <= 0,
    isSubmitting: mutation.isPending,
    confirm: () => mutation.mutate(),
    cancel: reset,
  }
}
