'use client'

import { useState } from 'react'
import type { ListingWithImages } from '@/lib/listings/queries'
import { ListingCard } from '@/components/ListingCard'
import Icon, { type IconName } from '@/components/Icon'
import styles from './index.module.css'

type Props = {
  listings: ListingWithImages[]
}

const TABS: { key: 'active' | 'completed' | 'pending'; icon: IconName; label: string }[] = [
  { key: 'active', icon: 'circleCheck', label: 'Активные' },
  { key: 'completed', icon: 'circleX', label: 'Завершённые' },
  { key: 'pending', icon: 'clock', label: 'На проверке' },
]

type TabKey = (typeof TABS)[number]['key']

export function MyListingsTabs({ listings }: Props) {
  const [tab, setTab] = useState<TabKey>('active')

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
            aria-label={t.label}
            title={t.label}
          >
            <span className={styles.tabDesktop}>{t.label}</span>
            <Icon name={t.icon} size={20} className={styles.tabMobile} />
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
