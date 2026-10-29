'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar } from '@/components/Avatar'
import { useAlert } from '@/components/AlertProvider'
import { uploadAvatarAction } from '@/lib/auth/actions'
import styles from './AvatarUploader.module.css'

type Props = {
  src: string | null
  name: string
}

export function AvatarUploader({ src, name }: Props) {
  const router = useRouter()
  const alert = useAlert()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [pending, startTransition] = useTransition()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.set('avatar', file)

    startTransition(async () => {
      const result = await uploadAvatarAction(undefined, formData)
      if (result.error) {
        alert.error(result.error)
      } else if (result.success) {
        alert.success('Аватар обновлён')
        router.refresh()
      }
      if (inputRef.current) inputRef.current.value = ''
    })
  }

  return (
    <>
      <button
        type="button"
        className={styles.avatarButton}
        onClick={() => inputRef.current?.click()}
        disabled={pending}
        aria-label="Загрузить аватар"
      >
        <Avatar src={src} name={name} size={74} />
        {pending && <span className={styles.avatarOverlay} />}
      </button>

      <input
        ref={inputRef}
        type="file"
        name="avatar"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </>
  )
}
