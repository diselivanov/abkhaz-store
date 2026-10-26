'use client'

import { useState, useTransition } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'
import { toggleBlockUserAction } from '@/lib/auth/admin'
import styles from './index.module.css'

export function BlockUserButton() {
  const { id, savedDocumentData } = useDocumentInfo()
  const [pending, startTransition] = useTransition()
  const [blocked, setBlocked] = useState<boolean>(
    Boolean((savedDocumentData as { blockedAt?: string | null })?.blockedAt),
  )

  if (!id) return null

  const isAdmin = (savedDocumentData as { role?: string })?.role === 'admin'
  if (isAdmin) return null

  const onClick = () => {
    const next = !blocked
    const ok = window.confirm(next ? 'Заблокировать пользователя?' : 'Разблокировать пользователя?')
    if (!ok) return

    startTransition(async () => {
      const result = await toggleBlockUserAction(Number(id), next)
      if (result.ok) {
        setBlocked(next)
        window.location.reload()
      } else {
        window.alert(result.error || 'Ошибка')
      }
    })
  }

  return (
    <button type="button" onClick={onClick} disabled={pending} className={styles.btn}>
      {pending ? '…' : blocked ? 'Разблокировать' : 'Заблокировать'}
    </button>
  )
}
