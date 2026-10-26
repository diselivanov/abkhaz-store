import Link from 'next/link'
import { AuthActions } from './AuthActions'
import styles from './index.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        Abkhaz Store
      </Link>
      <nav className={styles.center}></nav>
      <div className={styles.actions}>
        <AuthActions />
      </div>
    </header>
  )
}
