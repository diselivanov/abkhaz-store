'use client'

import styles from './index.module.css'

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
  round?: boolean
  loading?: boolean
  full?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  round = false,
  loading = false,
  full = false,
  disabled,
  children,
  className = '',
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${round ? styles.round : ''} ${full ? styles.full : ''} ${className}`}
    >
      {loading ? 'Загрузка…' : children}
    </button>
  )
}
