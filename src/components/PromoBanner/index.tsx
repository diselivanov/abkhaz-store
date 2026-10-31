'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import styles from './index.module.css'

const STORAGE_KEY = 'abkhaz-store-promo-last-seen'
const DELAY_MS = 1000
const INTERVAL_MS = 12 * 60 * 60 * 1000

export function PromoBanner() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()

  useEffect(() => {
    const lastSeen = localStorage.getItem(STORAGE_KEY)
    const now = Date.now()

    if (lastSeen && now - Number(lastSeen) < INTERVAL_MS) return

    const timer = setTimeout(() => {
      setOpen(true)
    }, DELAY_MS)

    return () => clearTimeout(timer)
  }, [])

  const markSeen = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()))
  }

  const onClose = () => {
    markSeen()
    setOpen(false)
  }

  const onGo = () => {
    markSeen()
    setOpen(false)
    router.push('/listings/new')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.banner}
          initial={reduce ? false : { x: 400, opacity: 0 }}
          animate={reduce ? undefined : { x: 0, opacity: 1 }}
          exit={reduce ? undefined : { x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className={styles.content}>
            <span className={styles.text}>Разместите объявление бесплатно за пару минут</span>
            <button type="button" className={styles.action} onClick={onGo}>
              Разместить
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
