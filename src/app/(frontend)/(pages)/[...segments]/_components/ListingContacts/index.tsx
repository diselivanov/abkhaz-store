import Link from 'next/link'
import type { User } from '@/payload-types'
import { Avatar } from '@/components/Avatar'
import styles from './index.module.css'

type Props = {
  author: User | null
  createdAt: string
  title: string
  price: string
  city: string | null
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString('ru-RU', { month: 'short' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

export function ListingContacts({ author, createdAt, title, price, city }: Props) {
  const name = author?.name || 'Пользователь'
  const avatarUrl = typeof author?.avatar === 'object' ? author.avatar?.url || null : null
  const phone = author?.phone || null

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.title}>{title}</h1>
        <div className={styles.price}>{price}</div>
        <div className={styles.meta}>
          {city && <span className={styles.metaItem}>{city}</span>}
          <span className={styles.metaItem}>{formatDate(createdAt)}</span>
        </div>
      </div>

      <div className={styles.divider} />

      {author ? (
        <Link href={`/users/${author.id}`} className={styles.author}>
          <Avatar src={avatarUrl} name={name} size={48} />
          <div className={styles.authorInfo}>
            <div className={styles.name}>{name}</div>
            <div className={styles.date}>На Abkhaz Store с {formatDate(createdAt)}</div>
          </div>
        </Link>
      ) : (
        <div className={styles.author}>
          <Avatar src={avatarUrl} name={name} size={48} />
          <div className={styles.authorInfo}>
            <div className={styles.name}>{name}</div>
          </div>
        </div>
      )}

      {phone ? (
        <a href={`tel:${phone}`} className={styles.phone}>
          {phone}
        </a>
      ) : (
        <span className={styles.noPhone}>Телефон не указан</span>
      )}
    </div>
  )
}
