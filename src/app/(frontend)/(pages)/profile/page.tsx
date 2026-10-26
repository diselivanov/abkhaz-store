import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Media } from '@/payload-types'
import { ProfileView } from './ProfileView'
import { AvatarUploader } from './AvatarUploader'

export const metadata: Metadata = {
  title: 'Профиль',
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/sign-in')

  const avatarUrl = typeof user.avatar === 'object' ? ((user.avatar as Media)?.url ?? null) : null

  return (
    <ProfileView
      name={user.name || null}
      email={user.email}
      role={user.role}
      avatarUploader={<AvatarUploader src={avatarUrl} name={user.name || user.email} />}
    />
  )
}
