/**
 * 컨트롤의 `aria-describedby` 값.
 *
 * 도움말이 있으면 **에러와 함께 둘 다** 나열한다 — 에러가 도움말을 대체하지 않는다.
 * id 규칙은 `Field`가 그리는 노드(`<id>-help` · `<id>-error`)와 한 쌍이다.
 */
export const describedBy = (id: string, hasHelp = false) =>
  hasHelp ? `${id}-help ${id}-error` : `${id}-error`
