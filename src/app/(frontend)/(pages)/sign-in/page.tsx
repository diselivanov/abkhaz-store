import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SignInForm } from './SignInForm'

export const metadata: Metadata = {
  title: 'Вход',
  robots: { index: false, follow: false },
}

export default async function SignInPage() {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (user) redirect('/profile')

  return <SignInForm />
}
