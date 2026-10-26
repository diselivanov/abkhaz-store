'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAlert } from '@/components/AlertProvider'
import { signInAction } from '@/lib/auth/actions'
import styles from './index.module.css'

export function SignInForm() {
  const router = useRouter()
  const alert = useAlert()
  const [pending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await signInAction(undefined, formData)
      if (result.error) {
        alert.error(result.error)
        return
      }
      if (result.success) {
        alert.success('Вы вошли в аккаунт')
        router.refresh()
        router.push('/')
      }
    })
  }

  return (
    <div className={styles.wrap}>
      <form action={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Вход</h1>

        <Input name="email" type="email" label="Email" autoComplete="email" required />
        <Input
          name="password"
          type="password"
          label="Пароль"
          autoComplete="current-password"
          required
        />

        <Button type="submit" loading={pending} full>
          Войти
        </Button>

        <p className={styles.hint}>
          Нет аккаунта? <Link href="/sign-up">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  )
}
