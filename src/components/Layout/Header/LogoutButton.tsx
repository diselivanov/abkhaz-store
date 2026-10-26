'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/Button'
import { ConfirmModal } from '@/components/ConfirmModal'
import { signOutAction } from '@/lib/auth/actions'

export function LogoutButton() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  const onConfirm = () => {
    startTransition(async () => {
      await signOutAction()
      setOpen(false)
      router.replace('/')
      router.refresh()
    })
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        Выйти
      </Button>
      <ConfirmModal
        open={open}
        title="Выйти из аккаунта?"
        description="Вы уверены, что хотите выйти?"
        confirmLabel="Выйти"
        onConfirm={onConfirm}
        onCancel={() => setOpen(false)}
        loading={pending}
      />
    </>
  )
}
