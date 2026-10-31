'use client'

import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import styles from './index.module.css'

export function SettingsHeader() {
  const router = useRouter()

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.back}
        onClick={() => router.back()}
        aria-label="Назад"
      >
        <Icon name="chevronLeft" size={22} />
      </button>
      <span className={styles.title}>Настройки</span>
      <span className={styles.spacer} />
    </header>
  )
}
