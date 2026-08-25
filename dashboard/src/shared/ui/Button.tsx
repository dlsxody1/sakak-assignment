import type { ComponentPropsWithoutRef } from 'react'

import { Spinner } from './Spinner'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'ghost'
  /** 진행 중이면 스피너를 앞에 그리고 버튼을 잠근다. */
  isLoading?: boolean
}

const VARIANTS = {
  primary: 'bg-slate-900 text-white disabled:bg-slate-400',
  ghost: 'border border-slate-300 text-slate-700 disabled:text-slate-400',
}

/**
 * 도메인을 모르는 버튼. `onClick`은 DOM 이벤트 위임이라 props로 받는다.
 *
 * `isLoading`이 스피너와 `disabled`를 함께 건다 — 호출부가 둘을 따로 넘기면
 * 한쪽만 걸린 버튼(도는데 눌리는, 잠겼는데 멈춘)이 생긴다.
 */
export function Button({
  variant = 'primary',
  isLoading = false,
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      aria-busy={isLoading || undefined}
      className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {isLoading && <Spinner />}
      {children}
    </button>
  )
}
