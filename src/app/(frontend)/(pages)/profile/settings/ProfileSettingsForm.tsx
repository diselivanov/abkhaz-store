'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useAlert } from '@/components/AlertProvider'
import { updateProfileAction } from '@/lib/auth/actions'
import styles from './ProfileSettingsForm.module.css'

const PHONE_PREFIX = '+7 '
const PHONE_DIGITS = 10

function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('7')) digits = digits.slice(1)
  digits = digits.slice(0, PHONE_DIGITS)

  const parts: string[] = []
  if (digits.length > 0) parts.push(digits.slice(0, 3))
  if (digits.length > 3) parts.push(digits.slice(3, 6))
  if (digits.length > 6) parts.push(digits.slice(6, 8))
  if (digits.length > 8) parts.push(digits.slice(8, 10))

  let result = PHONE_PREFIX
  if (parts[0]) result += parts[0]
  if (parts[1]) result += ` ${parts[1]}`
  if (parts[2]) result += `-${parts[2]}`
  if (parts[3]) result += `-${parts[3]}`

  return result.trimEnd()
}

function countDigits(value: string): number {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('7')) digits = digits.slice(1)
  return digits.length
}

const schema = z.object({
  name: z.string().trim().min(2, 'Минимум 2 символа').max(100, 'Максимум 100 символов'),
  phone: z
    .string()
    .refine((val) => countDigits(val) === PHONE_DIGITS, 'Введите телефон полностью')
    .or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

type Props = {
  initialName: string
  initialPhone: string
}

export function ProfileSettingsForm({ initialName, initialPhone }: Props) {
  const router = useRouter()
  const alert = useAlert()
  const [pending, startTransition] = useTransition()
  const [phone, setPhone] = useState(initialPhone ? formatPhone(initialPhone) : PHONE_PREFIX)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialName,
      phone: phone === PHONE_PREFIX ? '' : phone,
    },
  })

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setValue('phone', formatted === PHONE_PREFIX ? '' : formatted, { shouldValidate: true })
  }

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await updateProfileAction(data)
      if (!result.ok) {
        alert.error(result.error || 'Ошибка сохранения')
        return
      }
      alert.success('Профиль обновлён')
      router.push('/profile')
      router.refresh()
    })
  }

  const digitsCount = countDigits(phone)
  const isPhoneComplete = digitsCount === PHONE_DIGITS

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <Input id="name" label="Имя" {...register('name')} error={errors.name?.message} />

      <div className={`${styles.field} ${phone !== PHONE_PREFIX ? styles.hasValue : ''}`}>
        <div className={styles.inputWrap}>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={onPhoneChange}
            onKeyDown={(e) => {
              if (isPhoneComplete && e.key !== 'Backspace' && e.key !== 'Delete') {
                if (!/^\d$/.test(e.key) && e.key.length === 1) return
                if (e.key.length === 1) e.preventDefault()
              }
            }}
            className={styles.phoneInput}
          />
          <label htmlFor="phone" className={styles.label}>
            Телефон
          </label>
        </div>
        {errors.phone?.message && <span className={styles.error}>{errors.phone.message}</span>}
      </div>

      <Button type="submit" loading={pending} disabled={digitsCount > 0 && !isPhoneComplete} full>
        Сохранить
      </Button>
    </form>
  )
}
