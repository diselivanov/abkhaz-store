import styles from './index.module.css'

type Props = {
  name: string | null
  email: string
  role: 'admin' | 'user'
  avatarUploader: React.ReactNode
}

export function ProfileView({ name, email, role, avatarUploader }: Props) {
  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        {avatarUploader}
        <div className={styles.info}>
          <h1 className={styles.name}>{name || 'Без имени'}</h1>
          <p className={styles.email}>{email}</p>
          <span className={styles.role}>{role === 'admin' ? 'Администратор' : 'Пользователь'}</span>
        </div>
      </div>
    </div>
  )
}
