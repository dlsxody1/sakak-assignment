import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

/** 흰 표면 + 얕은 경계. 중첩하지 않는다. */
export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={`rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04)] ${className}`}
    >
      {children}
    </section>
  )
}
