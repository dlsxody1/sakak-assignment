import { useState } from 'react'

/** 펼침 토글 하나. 상태와 토글 함수를 함께 준다. */
export function useDisclosure(initial = false) {
  const [isOpen, setIsOpen] = useState(initial)
  return { isOpen, toggle: () => setIsOpen((open) => !open) }
}
