'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Post } from '@/payload-types'

import styles from './index.module.css'
import { PostCard } from '../PostCard'

type Filters = {
  gorod?: string
  tip?: string
  besplatno?: string
  rekomenduem?: string
}

type Props = {
  initialPosts: Post[]
  initialHasMore: boolean
  categorySlug?: string
  q?: string
  filters?: Filters
}

function buildQuery(page: number, categorySlug?: string, q?: string, filters?: Filters) {
  const params = new URLSearchParams()
  params.set('page', String(page))
  if (categorySlug) params.set('category', categorySlug)
  if (q) params.set('q', q)
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
  }
  return params.toString()
}

export function InfinitePosts({ initialPosts, initialHasMore, categorySlug, q, filters }: Props) {
  const [posts, setPosts] = useState<Post[]>(initialPosts)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialHasMore)
  const sentinelRef = useRef<HTMLDivElement | null>(null)
  const loadingRef = useRef(false)

  useEffect(() => {
    setPosts(initialPosts)
    setPage(1)
    setHasMore(initialHasMore)
  }, [initialPosts, initialHasMore])

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return
    loadingRef.current = true
    try {
      const nextPage = page + 1
      const qs = buildQuery(nextPage, categorySlug, q, filters)
      const res = await fetch(`/api/posts?${qs}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const data: { posts: Post[]; hasMore: boolean } = await res.json()
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id))
        return [...prev, ...data.posts.filter((p) => !seen.has(p.id))]
      })
      setPage(nextPage)
      setHasMore(Boolean(data.hasMore))
    } catch {
    } finally {
      loadingRef.current = false
    }
  }, [page, hasMore, categorySlug, q, filters])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadMore()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMore, hasMore])

  return (
    <>
      <div className={styles.grid}>
        {posts.map((post, i) => (
          <PostCard key={post.id} post={post} priority={i < 3} />
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} className={styles.sentinel} aria-hidden="true" />}
    </>
  )
}
