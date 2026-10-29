'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ListingWithImages } from '@/lib/listings/queries'
import { ListingCard } from '@/components/ListingCard'
import styles from './index.module.css'

type Props = {
  initialListings: ListingWithImages[]
  initialHasMore: boolean
  query: Record<string, string>
}

export function InfiniteListings({ initialListings, initialHasMore, query }: Props) {
  const [listings, setListings] = useState<ListingWithImages[]>(initialListings)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    setListings(initialListings)
    setPage(1)
    setHasMore(initialHasMore)
  }, [initialListings, initialHasMore])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    try {
      const nextPage = page + 1
      const params = new URLSearchParams(query)
      params.set('page', String(nextPage))
      const res = await fetch(`/api/listings?${params.toString()}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const data: { listings: ListingWithImages[]; hasMore: boolean } = await res.json()
      setListings((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...data.listings.filter((p) => !seen.has(p.id))]
      })
      setPage(nextPage)
      setHasMore(Boolean(data.hasMore))
    } catch {
    } finally {
      loadingRef.current = false
    }
  }, [page, hasMore, query])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore()
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasMore])

  if (listings.length === 0) {
    return <p className={styles.empty}>Ничего не найдено по вашему запросу</p>
  }

  return (
    <>
      <div className={styles.grid}>
        {listings.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} priority={i < 5} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />}
    </>
  )
}
