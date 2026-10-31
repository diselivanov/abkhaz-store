'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import Icon from '@/components/Icon'
import styles from './index.module.css'

type Props = {
  name: string
  phone: string | null
  whatsapp: string | null
  telegram: string | null
  description: string | null
  avatarUrl: string | null
  createdAt: string
  userId: number
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString('ru-RU', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

function getUrl(val: string, type: 'phone' | 'whatsapp' | 'telegram') {
  if (val.startsWith('http') || val.startsWith('tel:')) return val
  const clean = val.replace(/\D/g, '')
  if (type === 'phone') return `tel:${val}`
  if (type === 'whatsapp') return `https://wa.me/${clean || val.replace('@', '')}`
  if (type === 'telegram') return `https://t.me/${val.replace('@', '')}`
  return '#'
}

export function ProfileHeader({
  name,
  phone,
  whatsapp,
  telegram,
  description,
  avatarUrl,
  createdAt,
  userId,
}: Props) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleShare = async () => {
    const url = `${window.location.origin}/users/${userId}`
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
      } catch {}
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className={styles.header}>
      <div className={styles.mobileNav}>
        <div className={styles.mobileNavCenter}>Профиль</div>
        <div className={styles.mobileNavRight}>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => router.push('/profile/settings')}
            aria-label="Настройки"
          >
            <Icon name="settings" size={20} />
          </button>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={handleShare}
            aria-label="Поделиться"
          >
            <Icon name="share" size={20} />
          </button>
        </div>
      </div>

      <div className={styles.topRow}>
        <div className={styles.avatarWrap}>
          <Avatar src={avatarUrl} name={name} size={80} />
        </div>

        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          <div className={styles.date}>На Abkhaz Store с {formatDate(createdAt)}</div>
        </div>
      </div>

      {(phone || whatsapp || telegram) && (
        <div className={styles.contacts}>
          {phone && (
            <a
              href={getUrl(phone, 'phone')}
              className={styles.contactBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="phone" size={16} />
              <span>{phone}</span>
            </a>
          )}
          {whatsapp && (
            <a
              href={getUrl(whatsapp, 'whatsapp')}
              className={styles.contactBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="whatsapp" size={16} />
              <span>{whatsapp}</span>
            </a>
          )}
          {telegram && (
            <a
              href={getUrl(telegram, 'telegram')}
              className={styles.contactBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon name="telegram" size={16} />
              <span>{telegram}</span>
            </a>
          )}
        </div>
      )}

      {description && (
        <div className={styles.descriptionWrap}>
          <div className={`${styles.description} ${isExpanded ? styles.descriptionExpanded : ''}`}>
            {description}
          </div>
          {!isExpanded && (
            <button
              type="button"
              className={styles.descriptionToggle}
              onClick={() => setIsExpanded(true)}
            >
              Читать полностью...
            </button>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Button variant="ghost" size="md" round onClick={() => router.push('/profile/settings')}>
          Настройки
        </Button>
      </div>
    </div>
  )
}
