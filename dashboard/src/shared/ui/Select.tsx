import type { ComponentPropsWithoutRef } from 'react'
import { FiChevronDown } from 'react-icons/fi'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends ComponentPropsWithoutRef<'select'> {
  options: readonly SelectOption[]
  /** 미선택을 나타내는 첫 항목. 없으면 빈 값 자체가 없다는 뜻이다. */
  placeholder?: string
  invalid?: boolean
  /**
   * `compact`는 내용이 짧은 선택지(연도)용. 전폭을 쓰지 않는다.
   * 이름이 `size`가 아닌 것은 `<select size>`가 이미 숫자 속성이기 때문이다.
   */
  density?: 'default' | 'compact'
}

const DENSITIES = {
  default: 'w-full py-2 pl-3 pr-9',
  compact: 'w-auto py-1.5 pl-2.5 pr-8',
}

/**
 * 선택 컨트롤.
 *
 * 기본 화살표는 OS마다 크기가 달라 컴팩트 사이즈에서 위치가 깨진다 —
 * `appearance-none`으로 지우고 직접 그린다.
 *
 * `key`가 `value`가 아니라 `label`인 것은 의도적이다. 알뜰폰처럼 **다른 라벨이 같은
 * 코드값을 쓰는** 경우가 있어 value는 고유하지 않다.
 */
export function Select({
  options,
  placeholder,
  invalid = false,
  density = 'default',
  className = '',
  ...rest
}: SelectProps) {
  const border = invalid ? 'border-suspect' : 'border-slate-300'

  return (
    <div className={`relative ${density === 'default' ? 'w-full' : 'w-auto'}`}>
      <select
        className={`appearance-none rounded-lg border ${border} ${DENSITIES[density]} bg-white text-sm text-slate-900 disabled:bg-slate-50 disabled:text-slate-500 ${className}`}
        aria-invalid={invalid}
        {...rest}
      >
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <FiChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-slate-400"
      />
    </div>
  )
}
