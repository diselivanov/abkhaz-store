import Link from 'next/link'
import type { User } from '@/payload-types'
import { Avatar } from '@/components/Avatar'
import Icon from '@/components/Icon'
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

function getUrl(val: string, type: 'phone' | 'whatsapp' | 'telegram') {
  if (val.startsWith('http') || val.startsWith('tel:')) return val
  const clean = val.replace(/\D/g, '')
  if (type === 'phone') return `tel:${val}`
  if (type === 'whatsapp') return `https://wa.me/${clean || val.replace('@', '')}`
  if (type === 'telegram') return `https://t.me/${val.replace('@', '')}`
  return '#'
}

export function ListingContacts({ author, createdAt, title, price, city }: Props) {
  const name = author?.name || 'Пользователь'
  const avatarUrl = typeof author?.avatar === 'object' ? author.avatar?.url || null : null

  const phone = author?.phone || null
  const whatsapp = author?.whatsapp || null
  const telegram = author?.telegram || null
  const hasContacts = Boolean(phone || whatsapp || telegram)

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

      {hasContacts ? (
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
      ) : (
        <span className={styles.noPhone}>Контакты не указаны</span>
      )}
    </div>
  )
}
