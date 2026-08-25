import { Link } from '@tanstack/react-router'
import { FiCompass } from 'react-icons/fi'

import { Button } from '@/shared/ui/Button'
import { ErrorScreen } from '@/shared/ui/ErrorScreen'

/**
 * 주소를 사람이 읽을 수 있게 되돌린다.
 *
 * `location.pathname`은 퍼센트 인코딩된 상태다 — 한글 주소가
 * `/%EC%97%86%EB%8A%94...`로 나오면 오타를 확인하라는 말이 무의미해진다.
 * 잘못된 인코딩(`%zz`)이면 `decodeURIComponent`가 던지므로 원문을 그대로 쓴다.
 */
function readablePath(pathname: string) {
  try {
    return decodeURIComponent(pathname)
  } catch {
    return pathname
  }
}

/**
 * 없는 주소. 기본 `Not Found` 텍스트는 스타일도 나가는 길도 없다.
 *
 * 어느 주소가 없었는지 같이 보여준다 — 오타인지 죽은 링크인지는
 * 그걸 봐야 사용자가 판단한다.
 */
export function NotFoundPage() {
  return (
    <ErrorScreen
      icon={FiCompass}
      title="페이지를 찾을 수 없습니다"
      description="주소가 바뀌었거나 잘못 입력된 것 같습니다. 대시보드에서 다시 시작해 주세요."
      detail={typeof window === 'undefined' ? undefined : readablePath(window.location.pathname)}
      actions={
        <Link to="/">
          <Button>대시보드로 가기</Button>
        </Link>
      }
    />
  )
}
