'use client'

import { useState } from 'react'
import type { ListingWithImages } from '@/lib/listings/queries'
import { ListingCard } from '@/components/ListingCard'
import styles from './UserListingsTabs.module.css'

type Props = {
  listings: ListingWithImages[]
}

const TABS = [
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Завершённые' },
] as const

export function UserListingsTabs({ listings }: Props) {
  const [tab, setTab] = useState<'active' | 'completed'>('active')

  const filtered = listings.filter((l) => l.status === tab)

  return (
    <div className={styles.root}>
      <div className={styles.tabs}>
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            className={`${styles.tab} ${tab === t.key ? styles.tabActive : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={styles.empty}>Пока нет объявлений</p>
      ) : (
        <div className={styles.grid}>
          {filtered.map((ad) => (
            <ListingCard key={ad.id} listing={ad} />
          ))}
        </div>
      )}
    </div>
  )
}
