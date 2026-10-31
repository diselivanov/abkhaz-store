import Link from 'next/link'
import styles from './index.module.css'

const LINKS = [
  { label: 'Разместить объявление', href: '/listings/new' },
  { label: 'Блог об Абхазии', href: '/blog' },
  { label: 'Помощь', href: '/' },
  { label: 'Услуги', href: '/' },
  { label: 'Контакты', href: '/' },
]

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.copy}>© {new Date().getFullYear()} Abkhaz Store</span>
        </div>
        <nav className={styles.links}>
          {LINKS.map((link) => (
            <Link key={link.label} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
