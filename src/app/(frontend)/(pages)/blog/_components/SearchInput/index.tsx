'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Icon from '@/components/Icon'
import styles from './index.module.css'

type Props = {
  defaultValue?: string
  action: string
  hiddenCategory?: string
}

export function SearchInput({ defaultValue, action, hiddenCategory }: Props) {
  const [value, setValue] = useState(defaultValue || '')
  const router = useRouter()
  const pathname = usePathname()

  const clear = () => {
    setValue('')
    const params = new URLSearchParams()
    if (hiddenCategory) params.set('category', hiddenCategory)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <form action={action} method="get" className={styles.search}>
      <Icon name="search" size={18} className={styles.searchIcon} />
      <input
        type="text"
        name="q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Поиск по статьям"
        className={styles.searchInput}
      />
      {value && (
        <button type="button" className={styles.searchClear} onClick={clear} aria-label="Очистить">
          <Icon name="cross" size={22} />
        </button>
      )}
      {hiddenCategory && <input type="hidden" name="category" value={hiddenCategory} />}
    </form>
  )
}
