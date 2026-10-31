'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAlert } from '@/components/AlertProvider'
import { signUpAction } from '@/lib/auth/actions'
import styles from './index.module.css'

export function SignUpForm() {
  const router = useRouter()
  const alert = useAlert()
  const [pending, startTransition] = useTransition()

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await signUpAction(undefined, formData)
      if (result.error) {
        alert.error(result.error)
        return
      }
      if (result.success) {
        alert.success('Аккаунт создан')
        router.refresh()
        router.push('/')
      }
    })
  }

  return (
    <div className={styles.wrap}>
      <form action={handleSubmit} className={styles.form}>
        <h1 className={styles.title}>Регистрация</h1>

        <Input name="name" label="Отображаемое имя" autoComplete="name" required />
        <Input name="email" type="email" label="Email" autoComplete="email" required />
        <Input
          name="password"
          type="password"
          label="Пароль"
          autoComplete="new-password"
          minLength={8}
          required
        />

        <Button type="submit" loading={pending} full>
          Зарегистрироваться
        </Button>

        <p className={styles.hint}>
          Уже есть аккаунт? <Link href="/sign-in">Войти</Link>
        </p>
      </form>
    </div>
  )
}
