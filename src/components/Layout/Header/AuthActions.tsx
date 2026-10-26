'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from '@/components/Avatar'
import { LinkButton } from '@/components/LinkButton'
import { LogoutButton } from './LogoutButton'

type Me = {
  id: number
  name?: string | null
  email: string
  avatarUrl: string | null
} | null

export function AuthActions() {
  const [me, setMe] = useState<Me | undefined>(undefined)
  const pathname = usePathname()

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

  if (me === undefined) return null

  if (!me) {
    return (
      <LinkButton href="/sign-in" variant="primary" size="sm">
        Войти
      </LinkButton>
    )
  }

  return (
    <>
      <Link href="/profile" aria-label="Профиль">
        <Avatar src={me.avatarUrl} name={me.name || me.email} size={28} />
      </Link>
      <LogoutButton />
    </>
  )
}
