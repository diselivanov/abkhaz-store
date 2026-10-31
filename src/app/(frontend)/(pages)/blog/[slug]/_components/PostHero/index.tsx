'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import type { Media, User } from '@/payload-types'
import { ShareButton } from '../ShareButton'
import styles from './index.module.css'

type Props = {
  title: string
  cover: Media | null
  author: User | null
  date: string | null
  publishedAt: string | null
  readingTime: number | null
  location?: string | null
  shareUrl: string
}

function parseCoords(input?: string | null): { lat: number; lng: number } | null {
  if (!input) return null
  const m = input.match(/(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)/)
  if (!m) return null
  const lat = Number(m[1])
  const lng = Number(m[2])
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
  return { lat, lng }
}

export function PostHero({
  title,
  cover,
  author,
  date,
  publishedAt,
  readingTime,
  location,
  shareUrl,
}: Props) {
  const coords = parseCoords(location)
  const mapUrl = coords ? `https://yandex.ru/maps/?pt=${coords.lng},${coords.lat}&z=16&l=map` : null
  const router = useRouter()

  return (
    <div className={styles.hero}>
      {cover?.url && (
        <Image
          src={cover.url.replace(/^https?:\/\/[^/]+/, '')}
          alt={cover.alt || title}
          width={cover.width || 1200}
          height={cover.height || 600}
          className={styles.image}
          priority
        />
      )}
      <div className={styles.overlay} />

      <button
        type="button"
        className={styles.backButton}
        onClick={() => router.back()}
        aria-label="Назад"
      >
        <Icon name="chevronLeft" size={22} />
      </button>

      <div className={styles.actions}>
        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.mapButton}
            aria-label="Показать на карте"
          >
            <Icon name="mapPin" size={18} />
          </a>
        )}
        <ShareButton title={title} url={shareUrl} />
      </div>

      <div className={styles.body}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.meta}>
          <span className={styles.metaItem}>{author?.name}</span>
          {date && (
            <>
              <span className={styles.dot}>·</span>
              <time className={styles.metaItem} dateTime={publishedAt || undefined}>
                {date}
              </time>
            </>
          )}
          {readingTime && readingTime > 0 && (
            <>
              <span className={styles.dot}>·</span>
              <span className={styles.metaItem}>
                <Icon name="clock" size={14} />
                {readingTime} мин
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
