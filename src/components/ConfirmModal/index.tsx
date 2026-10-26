'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Button } from '../Button'
import styles from './index.module.css'

type Props = {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  loading = false,
}: Props) {
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          onClick={onCancel}
          initial={reduce ? false : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          exit={reduce ? undefined : { opacity: 0 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
          <motion.div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 8 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
            <div className={styles.actions}>
              <Button variant="ghost" onClick={onCancel} disabled={loading}>
                {cancelLabel}
              </Button>
              <Button onClick={onConfirm} loading={loading}>
                {confirmLabel}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
