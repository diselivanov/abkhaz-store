'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/Button'
import Icon from '@/components/Icon'
import { useAlert } from '@/components/AlertProvider'
import { updateProfileAction } from '@/lib/auth/actions'
import styles from './index.module.css'

const PHONE_PREFIX = '+7 '
const PHONE_DIGITS = 10
const MAX_DESCRIPTION = 300
const MAX_ROWS = 8

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
    .refine((val) => val === '' || countDigits(val) === PHONE_DIGITS, 'Введите телефон полностью'),
  whatsapp: z.string().optional(),
  telegram: z.string().optional(),
  description: z.string().max(MAX_DESCRIPTION, 'Достигнут лимит символов').optional(),
})

type FormValues = z.infer<typeof schema>

type Props = {
  initialName: string
  initialPhone: string
  initialWhatsapp?: string
  initialTelegram?: string
  initialDescription?: string
}

export function ProfileSettingsForm({
  initialName,
  initialPhone,
  initialWhatsapp = '',
  initialTelegram = '',
  initialDescription = '',
}: Props) {
  const router = useRouter()
  const alert = useAlert()
  const [pending, startTransition] = useTransition()
  const [phone, setPhone] = useState(initialPhone ? formatPhone(initialPhone) : PHONE_PREFIX)
  const [focusField, setFocusField] = useState<keyof FormValues | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initialName,
      phone: initialPhone ? formatPhone(initialPhone) : '',
      whatsapp: initialWhatsapp,
      telegram: initialTelegram,
      description: initialDescription,
    },
  })

  const values = watch()
  const { ref: descRef, ...descRest } = register('description')

  const autoResize = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'

    const computed = window.getComputedStyle(el)
    const lineHeight = parseInt(computed.lineHeight, 10) || 20
    const paddingTop = parseInt(computed.paddingTop, 10) || 0
    const paddingBottom = parseInt(computed.paddingBottom, 10) || 0
    const maxHeight = lineHeight * MAX_ROWS + paddingTop + paddingBottom

    if (el.scrollHeight > maxHeight) {
      el.style.height = `${maxHeight}px`
      el.style.overflowY = 'auto'
    } else {
      el.style.height = `${el.scrollHeight}px`
      el.style.overflowY = 'hidden'
    }
  }

  useEffect(() => {
    autoResize()
  }, [values.description])

  const onPhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    setPhone(formatted)
    setValue('phone', formatted === PHONE_PREFIX ? '' : formatted, { shouldValidate: true })
  }

  const onClear = (field: keyof FormValues) => {
    if (field === 'phone') setPhone(PHONE_PREFIX)
    setValue(field, '', { shouldValidate: true })
  }

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const result = await updateProfileAction(data)
      if (!result.ok) {
        alert.error(result.error || 'Ошибка сохранения')
        return
      }
      alert.success('Профиль обновлён')
      router.refresh()
    })
  }

  const handleFocus = (field: keyof FormValues) => () => setFocusField(field)
  const handleBlur = () => setFocusField(null)

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.field}>
        <div className={styles.row}>
          <label className={styles.rowLabel}>Имя:</label>
          <input
            className={styles.rowInput}
            {...register('name')}
            onFocus={handleFocus('name')}
            onBlur={handleBlur}
          />
          {focusField === 'name' && values.name && (
            <button
              type="button"
              className={styles.rowClear}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onClear('name')}
              aria-label="Очистить"
            >
              <Icon name="cross" size={18} />
            </button>
          )}
        </div>
        <span className={styles.hint}>Ваше публичное имя на сайте</span>
      </div>

      <div className={styles.field}>
        <div className={styles.row}>
          <label className={styles.rowLabel}>Телефон:</label>
          <input
            className={styles.rowInput}
            type="tel"
            value={phone}
            onChange={onPhoneChange}
            onFocus={handleFocus('phone')}
            onBlur={handleBlur}
            onKeyDown={(e) => {
              const isComplete = countDigits(phone) === PHONE_DIGITS
              if (isComplete && e.key !== 'Backspace' && e.key !== 'Delete') {
                if (!/^\d$/.test(e.key) && e.key.length === 1) return
                if (e.key.length === 1) e.preventDefault()
              }
            }}
          />
          {focusField === 'phone' && phone !== PHONE_PREFIX && (
            <button
              type="button"
              className={styles.rowClear}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onClear('phone')}
              aria-label="Очистить"
            >
              <Icon name="cross" size={18} />
            </button>
          )}
        </div>
        <span className={styles.hint}>В формате +7 900 000-00-00</span>
      </div>

      <div className={styles.field}>
        <div className={styles.row}>
          <label className={styles.rowLabel}>WhatsApp:</label>
          <input
            className={styles.rowInput}
            {...register('whatsapp')}
            onFocus={handleFocus('whatsapp')}
            onBlur={handleBlur}
          />
          {focusField === 'whatsapp' && values.whatsapp && (
            <button
              type="button"
              className={styles.rowClear}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onClear('whatsapp')}
              aria-label="Очистить"
            >
              <Icon name="cross" size={18} />
            </button>
          )}
        </div>
        <span className={styles.hint}>Номер телефона или ссылка</span>
      </div>

      <div className={styles.field}>
        <div className={styles.row}>
          <label className={styles.rowLabel}>Telegram:</label>
          <input
            className={styles.rowInput}
            {...register('telegram')}
            onFocus={handleFocus('telegram')}
            onBlur={handleBlur}
          />
          {focusField === 'telegram' && values.telegram && (
            <button
              type="button"
              className={styles.rowClear}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onClear('telegram')}
              aria-label="Очистить"
            >
              <Icon name="cross" size={18} />
            </button>
          )}
        </div>
        <span className={styles.hint}>Имя пользователя или ссылка</span>
      </div>

      <div className={styles.field}>
        <label className={styles.textareaLabel}>Описание:</label>
        <div className={styles.textareaWrap}>
          <textarea
            {...descRest}
            ref={(e) => {
              descRef(e)
              textareaRef.current = e
            }}
            className={styles.textarea}
            maxLength={MAX_DESCRIPTION}
            rows={1}
            onInput={autoResize}
            onFocus={handleFocus('description')}
            onBlur={handleBlur}
          />
          {focusField === 'description' && values.description && (
            <button
              type="button"
              className={styles.textareaClear}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onClear('description')
                requestAnimationFrame(autoResize)
              }}
              aria-label="Очистить"
            >
              <Icon name="cross" size={18} />
            </button>
          )}
        </div>
        <div className={styles.hintRow}>
          <span className={styles.hint}>Дополнительная информация по желанию</span>
          <span className={styles.counter}>
            {values.description?.length || 0}/{MAX_DESCRIPTION}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        loading={pending}
        disabled={phone !== PHONE_PREFIX && countDigits(phone) !== PHONE_DIGITS}
        full
      >
        Сохранить
      </Button>
    </form>
  )
}
