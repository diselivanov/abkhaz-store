'use client'

import { useState } from 'react'
import Icon from '@/components/Icon'
import styles from './index.module.css'

type Props = {
  title: string
  url: string
}

export function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false)

  const onClick = async () => {
    const absolute = url.startsWith('http')
      ? url
      : typeof window !== 'undefined'
        ? new URL(url, window.location.origin).toString()
        : url

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, url: absolute })
        return
      } catch {
        return
      }
    }

    try {
      await navigator.clipboard.writeText(absolute)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <button type="button" className={styles.button} onClick={onClick} aria-label={'Поделиться'}>
      <Icon name="share" size={20} />
    </button>
  )
}
