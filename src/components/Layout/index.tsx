import { Header } from './Header'
import { BottomNav } from './BottomNav'
import styles from './index.module.css'

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <Header />
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  )
}
