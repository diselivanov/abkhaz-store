'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Drawer } from 'vaul'
import Icon from '@/components/Icon'
import styles from './index.module.css'

export type FilterSelectOption = { value: string; label: string }

type Props = {
  id?: string
  placeholder?: string
  error?: string
  value: string
  onChange: (value: string) => void
  options: FilterSelectOption[]
  disabled?: boolean
}

export function FilterSelect({
  id,
  placeholder,
  error,
  value,
  onChange,
  options,
  disabled = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const reduce = useReducedMotion()

  const selected = useMemo(() => options.find((o) => o.value === value) || null, [options, value])

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
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open, isMobile])

  useEffect(() => {
    if (!open) return
    const idx = options.findIndex((o) => o.value === value)
    setHighlight(idx >= 0 ? idx : 0)
  }, [open, options, value])

  const openList = () => {
    if (disabled) return
    setOpen((v) => !v)
  }

  const selectOption = (opt: FilterSelectOption) => {
    onChange(opt.value === value ? '' : opt.value)
    setOpen(false)
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.min(h + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setOpen(true)
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (!open) {
        e.preventDefault()
        setOpen(true)
        return
      }
      e.preventDefault()
      const opt = options[highlight]
      if (opt) selectOption(opt)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const list = (
    <ul role="listbox" className={styles.dropdown}>
      {options.map((opt, i) => (
        <li
          key={opt.value}
          role="option"
          aria-selected={opt.value === value}
          className={`${styles.option} ${i === highlight ? styles.optionHighlight : ''}`}
          onMouseEnter={() => setHighlight(i)}
          onMouseDown={(e) => {
            e.preventDefault()
            selectOption(opt)
          }}
        >
          <span className={styles.optionLabel}>{opt.label}</span>
          {opt.value === value && <Icon name="check" size={16} className={styles.optionCheck} />}
        </li>
      ))}
    </ul>
  )

  const desktopDropdown = (
    <AnimatePresence>
      {open && options.length > 0 && (
        <motion.div
          className={styles.dropdownWrap}
          initial={reduce ? false : { opacity: 0, y: -4, scaleY: 0.98 }}
          animate={reduce ? undefined : { opacity: 1, y: 0, scaleY: 1 }}
          exit={reduce ? undefined : { opacity: 0, y: -4, scaleY: 0.98 }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
          style={{ transformOrigin: 'top center' }}
        >
          {list}
        </motion.div>
      )}
    </AnimatePresence>
  )

  return (
    <div className={styles.field} ref={rootRef}>
      <div
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onClick={openList}
        onKeyDown={onKeyDown}
        className={`${styles.input} ${error ? styles.inputError : ''} ${disabled ? styles.inputDisabled : ''} ${open ? styles.inputFocused : ''}`}
      >
        <span className={styles.textWrap}>
          {placeholder && (
            <span className={styles.placeholder}>
              {placeholder}
              {selected ? ':' : ''}
            </span>
          )}
          <span className={selected ? styles.value : styles.valueEmpty}>
            {selected?.label || ''}
          </span>
        </span>
        <Icon name="chevronUpDown" size={14} className={styles.chevron} />
      </div>

      {isMobile
        ? mounted &&
          createPortal(
            <Drawer.Root open={open} onOpenChange={setOpen}>
              <Drawer.Portal>
                <Drawer.Overlay className={styles.drawerOverlay} />
                <Drawer.Content className={styles.drawerContent}>
                  <Drawer.Handle className={styles.drawerHandle} />
                  {placeholder && <div className={styles.drawerTitle}>{placeholder}</div>}
                  <div className={styles.drawerList}>{list}</div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>,
            document.body,
          )
        : desktopDropdown}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
