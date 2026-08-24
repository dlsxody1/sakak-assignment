import type { ComponentPropsWithoutRef } from 'react'

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'primary' | 'ghost'
}

const VARIANTS = {
  primary: 'bg-slate-900 text-white disabled:bg-slate-400',
  ghost: 'border border-slate-300 text-slate-700 disabled:text-slate-400',
}

/** 도메인을 모르는 버튼. `onClick`은 DOM 이벤트 위임이라 props로 받는다. */
export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`w-full rounded-lg px-4 py-2.5 text-sm font-medium ${VARIANTS[variant]} ${className}`}
      {...rest}
    />
  )
}
