import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { SignUpForm } from './SignUpForm'

export const metadata: Metadata = {
  title: 'Регистрация',
  robots: { index: false, follow: false },
}

export default async function SignUpPage() {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (user) redirect('/profile')

  return <SignUpForm />
}
