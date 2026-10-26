'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import styles from './index.module.css'

type Variant = 'error' | 'success'

type Toast = {
  id: number
  variant: Variant
  message: string
}

type AlertApi = {
  show: (variant: Variant, message: string) => void
  error: (message: string) => void
  success: (message: string) => void
  dismiss: (id: number) => void
}

const AlertContext = createContext<AlertApi | null>(null)

const AUTO_DISMISS_MS = 5000

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const reduce = useReducedMotion()

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const show = useCallback(
    (variant: Variant, message: string) => {
      const id = Date.now() + Math.random()
      setToasts((prev) => [{ id, variant, message }, ...prev])
      window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS)
    },
    [dismiss],
  )

  const api = useMemo<AlertApi>(
    () => ({
      show,
      error: (m) => show('error', m),
      success: (m) => show('success', m),
      dismiss,
    }),
    [show, dismiss],
  )

  return (
    <AlertContext.Provider value={api}>
      {children}
      <div className={styles.viewport} aria-live="polite" aria-atomic="false">
        <AnimatePresence initial={false} mode="popLayout">
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              className={`${styles.toast} ${styles[t.variant]}`}
              role="alert"
              initial={reduce ? false : { opacity: 0, y: -16, scale: 0.9 }}
              animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -16, scale: 0.9 }}
              transition={{
                layout: { type: 'spring', stiffness: 500, damping: 40, mass: 0.6 },
                opacity: { duration: 0.1, ease: 'easeOut' },
                y: { type: 'spring', stiffness: 600, damping: 35 },
                scale: { duration: 0.12, ease: 'easeOut' },
              }}
            >
              {t.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AlertContext.Provider>
  )
}

export function useAlert(): AlertApi {
  const ctx = useContext(AlertContext)
  if (!ctx) throw new Error('useAlert must be used within AlertProvider')
  return ctx
}
