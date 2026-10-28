'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '@/components/Icon'
import styles from './index.module.css'

export type SearchSelectOption = { value: string; label: string }

type Props = {
  id?: string
  label?: string
  error?: string
  value: string
  onChange: (value: string) => void
  options: SearchSelectOption[]
  disabled?: boolean
  loading?: boolean
}

export function SearchSelect({
  id,
  label,
  error,
  value,
  onChange,
  options,
  disabled = false,
  loading = false,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState(0)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const reduce = useReducedMotion()

  const selected = options.find((o) => o.value === value) || null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return options
    return options.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  useEffect(() => {
    if (!open) return
    setHighlight(0)
  }, [query, open])

  const openList = () => {
    if (disabled || loading) return
    setOpen(true)
    setQuery('')
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const selectOption = (opt: SearchSelectOption) => {
    onChange(opt.value)
    setOpen(false)
    setQuery('')
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlight((h) => Math.min(h + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlight((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = filtered[highlight]
      if (opt) selectOption(opt)
    } else if (e.key === 'Escape') {
      setOpen(false)
      setQuery('')
    }
  }

  const floating = open || Boolean(selected) || Boolean(query)

  return (
    <div className={styles.field} ref={rootRef}>
      <div className={styles.inputWrap}>
        <div
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={openList}
          className={`${styles.input} ${error ? styles.inputError : ''} ${disabled ? styles.inputDisabled : ''} ${open ? styles.inputFocused : ''}`}
        >
          {open ? (
            <div className={styles.searchWrap}>
              <Icon name="search" size={14} className={styles.searchIcon} />
              <input
                ref={inputRef}
                type="text"
                className={styles.searchInput}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Поиск"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          ) : (
            <span className={styles.value}>{selected?.label || ''}</span>
          )}
          <Icon name="chevronUpDown" size={14} className={styles.chevron} />
          {label && (
            <span className={`${styles.label} ${floating ? styles.labelFloating : ''}`}>
              {label}
            </span>
          )}
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              className={styles.dropdown}
              initial={reduce ? false : { opacity: 0, y: -4, scaleY: 0.98 }}
              animate={reduce ? undefined : { opacity: 1, y: 0, scaleY: 1 }}
              exit={reduce ? undefined : { opacity: 0, y: -4, scaleY: 0.98 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              style={{ transformOrigin: 'top center' }}
            >
              <ul role="listbox" className={styles.list}>
                {loading && <li className={styles.emptyItem}>Загрузка…</li>}
                {!loading && filtered.length === 0 && (
                  <li className={styles.emptyItem}>Ничего не найдено</li>
                )}
                {!loading &&
                  filtered.map((opt, i) => (
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
                      {opt.value === value && (
                        <Icon name="check" size={16} className={styles.optionCheck} />
                      )}
                    </li>
                  ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
