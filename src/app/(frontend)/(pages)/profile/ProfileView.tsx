import Link from 'next/link'
import { Button } from '@/components/Button'
import styles from './index.module.css'

type Props = {
  name: string | null
  email: string
  phone: string | null
  role: 'admin' | 'user'
  avatarUploader: React.ReactNode
}

export function ProfileView({ name, email, phone, role, avatarUploader }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {avatarUploader}
        <div className={styles.info}>
          <h1 className={styles.name}>{name || 'Без имени'}</h1>
          <p className={styles.email}>{email}</p>
          {phone && <p className={styles.phone}>{phone}</p>}
          <span className={styles.role}>{role === 'admin' ? 'Администратор' : 'Пользователь'}</span>
        </div>

        <div className={styles.actions}>
          <Link href="/profile/listings" className={styles.actionLink}>
            Мои объявления
          </Link>
          <Link href="/profile/settings" className={styles.actionLink}>
            Настройки профиля
          </Link>
          {role === 'admin' && (
            <Link href="/admin" className={styles.actionLink}>
              Админ-панель
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
