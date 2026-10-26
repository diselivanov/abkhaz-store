import Image from 'next/image'
import styles from './index.module.css'

type Props = {
  src?: string | null
  name?: string | null
  size?: number
  className?: string
}

function getInitials(name?: string | null): string {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export function Avatar({ src, name, size = 32, className = '' }: Props) {
  const style = { width: size, height: size, fontSize: Math.round(size * 0.4) }

  if (src) {
    return (
      <Image
        src={src.replace(/^https?:\/\/[^/]+/, '')}
        alt={name || 'Аватар'}
        width={size}
        height={size}
        className={`${styles.avatar} ${className}`}
        style={style}
      />
    )
  }

  return (
    <span className={`${styles.fallback} ${className}`} style={style} aria-label={name || 'Аватар'}>
      {getInitials(name)}
    </span>
  )
}
