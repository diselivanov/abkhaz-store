'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, getListingUrl } from '@/lib/listings/format'
import type { ListingWithImages } from '@/lib/listings/queries'
import type { ListingCategory, ListingCity, ListingSubcategory } from '@/payload-types'
import styles from './index.module.css'

type Props = {
  listing: ListingWithImages
  priority?: boolean
}

export function ListingCard({ listing, priority = false }: Props) {
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const mediaRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const touchStartX = useRef<number | null>(null)

  const images = listing.images

  const city = typeof listing.city === 'object' ? (listing.city as ListingCity) : null
  const category =
    typeof listing.category === 'object' ? (listing.category as ListingCategory) : null
  const subcategory =
    typeof listing.subcategory === 'object' ? (listing.subcategory as ListingSubcategory) : null

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const href = useMemo(() => {
    if (!city || !category || !subcategory) return '#'
    return getListingUrl({
      slug: listing.slug,
      city: { slug: city.slug },
      category: { slug: category.slug },
      subcategory: { slug: subcategory.slug },
    })
  }, [listing.slug, city, category, subcategory])

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || images.length < 2) return
    const el = mediaRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left
    const ratio = x / rect.width
    const index = Math.min(images.length - 1, Math.max(0, Math.floor(ratio * images.length)))
    if (index !== active) setActive(index)
  }

  const onMouseLeave = () => {
    if (isMobile) return
    setActive(0)
  }

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || touchStartX.current == null || images.length < 2) {
      touchStartX.current = null
      return
    }
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const diff = endX - touchStartX.current
    touchStartX.current = null

    const threshold = 30
    if (Math.abs(diff) < threshold) return

    setActive((prev) => {
      if (diff < 0) return prev + 1 >= images.length ? 0 : prev + 1
      return prev - 1 < 0 ? images.length - 1 : prev - 1
    })
  }

  const onScroll = () => {
    if (!isMobile) return
    const el = scrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width === 0) return
    const idx = Math.round(el.scrollLeft / width)
    if (idx !== active) setActive(idx)
  }

  const cover = images[active]

  return (
    <Link href={href} className={styles.card}>
      <div
        ref={mediaRef}
        className={styles.media}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
      >
        {isMobile && images.length > 1 ? (
          <div className={styles.track} ref={scrollRef} onScroll={onScroll}>
            {images.map((img, i) => (
              <div key={img.id} className={styles.slide}>
                {img.url && (
                  <Image
                    src={img.url.replace(/^https?:\/\/[^/]+/, '')}
                    alt={img.alt || listing.title}
                    width={img.width || 600}
                    height={img.height || 600}
                    className={styles.cover}
                    priority={priority && i === 0}
                    loading={priority && i === 0 ? 'eager' : 'lazy'}
                  />
                )}
              </div>
            ))}
          </div>
        ) : cover?.url ? (
          <Image
            src={cover.url.replace(/^https?:\/\/[^/]+/, '')}
            alt={cover.alt || listing.title}
            width={cover.width || 600}
            height={cover.height || 600}
            className={styles.cover}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className={styles.cover} />
        )}

        {images.length > 1 && (
          <div className={styles.dots} aria-hidden="true">
            {images.map((_, i) => (
              <span key={i} className={`${styles.dot} ${i === active ? styles.dotActive : ''}`} />
            ))}
          </div>
        )}
      </div>

      <div className={styles.body}>
        <h3 className={styles.title}>{listing.title}</h3>
        <div className={styles.price}>{formatPrice(listing.price)}</div>
        {city && <div className={styles.city}>{city.title}</div>}
      </div>
    </Link>
  )
}
