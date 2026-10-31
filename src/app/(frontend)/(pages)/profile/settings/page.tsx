import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Media } from '@/payload-types'
import { ProfileSettingsForm } from '../_components/ProfileSettingsForm'
import { AvatarUploader } from '../_components/AvatarUploader'
import { LogoutButton } from '../_components/LogoutButton'
import { SettingsHeader } from '../_components/SettingsHeader'
import styles from './index.module.css'

export const metadata: Metadata = {
  title: 'Настройки профиля',
  robots: { index: false, follow: false },
}

export default async function ProfileSettingsPage() {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/sign-in')

  const avatarUrl = typeof user.avatar === 'object' ? ((user.avatar as Media)?.url ?? null) : null

  return (
    <>
      <SettingsHeader />
      <div className={styles.wrapper}>
        <h1 className={styles.title}>Настройки</h1>
        <AvatarUploader src={avatarUrl} name={user.name || user.email} />
        <ProfileSettingsForm
          initialName={user.name || ''}
          initialPhone={user.phone || ''}
          initialWhatsapp={user.whatsapp || ''}
          initialTelegram={user.telegram || ''}
          initialDescription={user.description || ''}
        />
        <LogoutButton full />
      </div>
    </>
  )
}
