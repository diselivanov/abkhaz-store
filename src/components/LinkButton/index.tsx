import Link from 'next/link'
import styles from './index.module.css'

type Props = {
  href: string
  variant?: 'primary' | 'ghost' | 'plain'
  size?: 'sm' | 'md'
  round?: boolean
  children: React.ReactNode
}

export function LinkButton({
  href,
  variant = 'primary',
  size = 'md',
  round = false,
  children,
}: Props) {
  return (
    <Link
      href={href}
      className={`${styles.btn} ${styles[variant]} ${styles[size]} ${round ? styles.round : ''}`}
    >
      {children}
    </Link>
  )
}
