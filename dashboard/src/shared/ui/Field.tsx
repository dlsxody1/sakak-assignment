import type { ReactNode } from 'react'

interface FieldProps {
  /** 컨트롤의 `id`. 도움말·에러 노드 id가 여기서 파생된다. */
  id: string
  label: string
  help?: string
  error?: string
  /**
   * 컨트롤이 둘 이상인 그룹(조회 기간)은 `label`이 하나를 가리킬 수 없어 `span`을 쓴다.
   * 라디오처럼 `fieldset`/`legend`가 필요한 경우는 Field를 쓰지 않는다.
   */
  as?: 'label' | 'span'
  children: ReactNode
}

/**
 * 라벨 + 컨트롤 + 도움말 + 에러 한 묶음.
 *
 * **에러 노드는 내용이 비어도 항상 렌더한다** — 노드가 생겼다 사라지면
 * `aria-describedby` 참조가 끊긴다. 컨트롤 쪽은 `shared/lib/aria`의
 * `describedBy(id, hasHelp)`로 같은 id를 가리킨다.
 */
export function Field({ id, label, help, error, as = 'label', children }: FieldProps) {
  const LabelTag = as
  const labelProps = as === 'label' ? { htmlFor: id } : {}

  return (
    <div>
      <LabelTag {...labelProps} className="block text-sm font-medium text-slate-700">
        {label}
      </LabelTag>
      <div className="mt-1">{children}</div>
      {help !== undefined && (
        <p id={`${id}-help`} className="mt-1 text-xs text-slate-500">
          {help}
        </p>
      )}
      <p id={`${id}-error`} className="mt-1 text-xs text-suspect">
        {error}
      </p>
    </div>
  )
}
