import Link from 'next/link'
import Image from 'next/image'
import { AuthActions } from './AuthActions'
import styles from './index.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo} aria-label="Abkhaz Store">
        <Image
          src="/android-chrome-512x512.png"
          alt="Abkhaz Store"
          width={30}
          height={30}
          priority
        />
        <span className={styles.logoText}>Abkhaz Store</span>
      </Link>
      <nav className={styles.center}></nav>
      <div className={styles.actions}>
        <AuthActions />
      </div>
    </header>
  )
}
