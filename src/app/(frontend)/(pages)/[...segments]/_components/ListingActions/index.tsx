'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Drawer } from 'vaul'
import Icon from '@/components/Icon'
import { ConfirmModal } from '@/components/ConfirmModal'
import { useAlert } from '@/components/AlertProvider'
import { updateListingStatusAction } from '@/actions/listings/updateListingStatus'
import styles from './index.module.css'

type Props = {
  adId: number
  status: 'pending' | 'active' | 'completed'
  editHref: string
}

export function ListingActions({ adId, status, editHref }: Props) {
  const router = useRouter()
  const alert = useAlert()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (!open || isMobile) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, isMobile])

  const onToggleStatus = () => {
    setOpen(false)
    setConfirmOpen(true)
  }

  const onConfirm = () => {
    startTransition(async () => {
      const next = status === 'active' ? 'completed' : 'active'
      const result = await updateListingStatusAction(adId, next)
      setConfirmOpen(false)
      if (!result.ok) {
        alert.error(result.error || 'Ошибка')
        return
      }
      alert.success(
        next === 'active' ? 'Объявление восстановлено' : 'Объявление снято с публикации',
      )
      router.refresh()
    })
  }

  const toggleLabel = status === 'active' ? 'Снять с публикации' : 'Восстановить'
  const canEdit = status !== 'completed'
  const canToggle = status !== 'pending'

  if (!canEdit && !canToggle) return null

  const items = (
    <>
      {canEdit && (
        <button
          type="button"
          className={styles.item}
          onClick={() => {
            setOpen(false)
            router.push(editHref)
          }}
        >
          <Icon name="edit" size={16} className={styles.itemIcon} />
          <span>Редактировать</span>
        </button>
      )}

      {canToggle && (
        <button type="button" className={styles.item} onClick={onToggleStatus}>
          <Icon
            name={status === 'active' ? 'trash' : 'rotateCcw'}
            size={16}
            className={styles.itemIcon}
          />
          <span>{toggleLabel}</span>
        </button>
      )}
    </>
  )

  return (
    <>
      <div className={styles.root} ref={rootRef}>
        <button
          type="button"
          className={styles.trigger}
          onClick={() => setOpen((v) => !v)}
          aria-label="Действия"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <Icon name="ellipsis" size={20} />
        </button>

        {!isMobile && (
          <AnimatePresence>
            {open && (
              <motion.div
                role="menu"
                className={styles.dropdown}
                initial={reduce ? false : { opacity: 0, y: -4, scaleY: 0.98 }}
                animate={reduce ? undefined : { opacity: 1, y: 0, scaleY: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -4, scaleY: 0.98 }}
                transition={{ duration: 0.12, ease: 'easeOut' }}
                style={{ transformOrigin: 'top right' }}
              >
                {items}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {isMobile &&
        mounted &&
        createPortal(
          <Drawer.Root open={open} onOpenChange={setOpen}>
            <Drawer.Portal>
              <Drawer.Overlay className={styles.drawerOverlay} />
              <Drawer.Content className={styles.drawerContent}>
                <Drawer.Handle className={styles.drawerHandle} />
                <div className={styles.drawerTitle}>Действия</div>
                <div className={styles.drawerList}>{items}</div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>,
          document.body,
        )}

      <ConfirmModal
        open={confirmOpen}
        title={status === 'active' ? 'Снять с публикации?' : 'Восстановить объявление?'}
        description={
          status === 'active'
            ? 'Объявление будет скрыто из поиска.'
            : 'Объявление снова будет отображаться в поиске.'
        }
        confirmLabel={toggleLabel}
        onConfirm={onConfirm}
        onCancel={() => setConfirmOpen(false)}
        loading={pending}
      />
    </>
  )
}
