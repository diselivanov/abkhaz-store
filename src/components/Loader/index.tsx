'use client'

import { motion, useReducedMotion } from 'motion/react'
import styles from './index.module.css'

type Props = {
  variant?: 'page' | 'spinner'
  size?: number
  text?: string
  className?: string
}

export function Loader({
  variant = 'spinner',
  size = 32,
  text = 'Abkhaz Store',
  className,
}: Props) {
  const reduce = useReducedMotion()

  if (variant === 'page') {
    return (
      <div className={`${styles.page} ${className || ''}`} role="status" aria-live="polite">
        <motion.span
          className={styles.wave}
          aria-label={text}
          initial={{ backgroundPosition: '150% 0%' }}
          animate={reduce ? undefined : { backgroundPosition: ['150% 0%', '-150% 0%'] }}
          transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
        >
          {text}
        </motion.span>
      </div>
    )
  }

  return (
    <div
      className={`${styles.spinner} ${className || ''}`}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Загрузка"
    >
      <motion.span
        className={styles.spinnerCircle}
        animate={reduce ? undefined : { rotate: 360 }}
        transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
      />
    </div>
  )
}
