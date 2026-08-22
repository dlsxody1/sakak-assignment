import { useInquiry } from '../model/inquiry-store'
import { AuthWaiting } from './AuthWaiting'
import { InquiryForm } from './InquiryForm'

/**
 * 인증 절차. 단계에 따라 폼과 대기 화면을 갈아 끼운다.
 *
 * 카드를 새로 만들지 않고 **내용만** 바꾼다 — 둘은 하나의 절차이고,
 * 카드가 통째로 바뀌면 사용자는 자기가 어디 있는지 다시 찾아야 한다.
 */
export function CheckupInquiry() {
  const stage = useInquiry((state) => state.stage)

  return stage === 'waiting' ? <AuthWaiting /> : <InquiryForm />
}
