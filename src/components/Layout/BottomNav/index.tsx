'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Icon from '@/components/Icon'
import { Avatar } from '@/components/Avatar'
import styles from './index.module.css'

type Me = {
  id: number
  name?: string | null
  email: string
  avatarUrl: string | null
} | null

export function BottomNav() {
  const pathname = usePathname()
  const [me, setMe] = useState<Me | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    fetch('/api/users/me', { cache: 'no-store', credentials: 'include' })
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => {
        if (cancelled) return
        const u = data?.user
        setMe(
          u
            ? {
                id: u.id,
                name: u.name ?? null,
                email: u.email,
                avatarUrl: typeof u.avatar === 'object' ? (u.avatar?.url ?? null) : null,
              }
            : null,
        )
      })
      .catch(() => {
        if (!cancelled) setMe(null)
      })
    return () => {
      cancelled = true
    }
  }, [pathname])

  const isHome = pathname === '/'
  const isNew = pathname === '/listings/new'
  const isProfile = pathname === '/profile' || pathname.startsWith('/profile/')

  const avatarName = me?.name || me?.email || null
  const avatarSrc = me?.avatarUrl ?? null

  return (
    <nav className={styles.nav} aria-label="Основная навигация">
      <Link
        href="/"
        className={`${styles.item} ${isHome ? styles.itemActive : ''}`}
        aria-label="Главная"
        aria-current={isHome ? 'page' : undefined}
      >
        <Icon name="home" size={24} />
      </Link>

      <Link
        href="/listings/new"
        className={`${styles.item} ${isNew ? styles.itemActive : ''}`}
        aria-label="Разместить объявление"
        aria-current={isNew ? 'page' : undefined}
      >
        <Icon name="plus" size={24} />
      </Link>

      <Link
        href="/profile"
        className={`${styles.item} ${isProfile ? styles.itemActive : ''}`}
        aria-label="Профиль"
        aria-current={isProfile ? 'page' : undefined}
      >
        <span className={`${styles.avatarWrap} ${isProfile ? styles.avatarWrapActive : ''}`}>
          <Avatar src={avatarSrc} name={avatarName} size={28} />
        </span>
      </Link>
    </nav>
  )
}
