import { Link, useRouter } from '@tanstack/react-router'
import { FiAlertTriangle } from 'react-icons/fi'

import { Button } from '@/shared/ui/Button'
import { ErrorScreen } from '@/shared/ui/ErrorScreen'

/**
 * 렌더링 중에 터진 예외를 받는다. 이게 없으면 React가 트리를 통째로
 * 버려서 **흰 화면**이 남는다 — 사용자는 무엇이 잘못됐는지도, 뭘 할지도 모른다.
 *
 * 원인 문자열은 그대로 노출한다. 여기 걸리는 건 API 실패가 아니라
 * 우리 코드의 버그이고, 사용자가 문의할 때 옮겨 적을 단서가 필요하다.
 *
 * `router.invalidate()`가 재시도다 — 새로고침과 달리 앱을 다시 받지 않고
 * 라우트만 다시 그린다. 일시적인 실패면 이걸로 돌아온다.
 */
export function RouteErrorPage({ error }: { error: Error }) {
  const router = useRouter()

  return (
    <ErrorScreen
      icon={FiAlertTriangle}
      title="화면을 표시하지 못했습니다"
      description="일시적인 문제일 수 있습니다. 다시 시도해도 같으면 잠시 후 열어 주세요."
      detail={error.message}
      actions={
        <>
          <Button onClick={() => router.invalidate()}>다시 시도</Button>
          <Link to="/">
            <Button variant="ghost">대시보드로 가기</Button>
          </Link>
        </>
      }
    />
  )
}
