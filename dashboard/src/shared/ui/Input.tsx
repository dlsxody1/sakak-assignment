import type { ComponentPropsWithoutRef } from 'react'

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  /** 검증에 걸린 상태. 테두리를 위험색으로 바꾸고 `aria-invalid`를 세운다. */
  invalid?: boolean
}

/** 폼 입력 한 칸. 포커스 링은 전역 `:focus-visible`이 그린다. */
export function Input({ invalid = false, className = '', ...rest }: InputProps) {
  const border = invalid ? 'border-suspect' : 'border-slate-300'

  return (
    <input
      className={`w-full rounded-lg border ${border} px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
      aria-invalid={invalid}
      {...rest}
    />
  )
}
