'use client'

import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/Avatar'
import { Button } from '@/components/Button'
import styles from './ProfileSidebar.module.css'

type Props = {
  name: string
  phone: string | null
  avatarUrl: string | null
  createdAt: string
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString('ru-RU', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export function ProfileSidebar({ name, phone, avatarUrl, createdAt }: Props) {
  const router = useRouter()

  return (
    <aside className={styles.sidebar}>
      <div className={styles.user}>
        <Avatar src={avatarUrl} name={name} size={74} />
        <div className={styles.info}>
          <div className={styles.name}>{name}</div>
          {phone && <div className={styles.phone}>{phone}</div>}
          <div className={styles.date}>На Abkhaz Store с {formatDate(createdAt)}</div>
        </div>
      </div>

      <Button variant="ghost" size="md" round full onClick={() => router.push('/profile/settings')}>
        Настройки
      </Button>
    </aside>
  )
}
