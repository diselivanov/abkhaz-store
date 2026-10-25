'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Tag } from '@/payload-types'
import { Select } from '@/app/(frontend)/(pages)/blog/_components/Select'
import { CheckboxInput } from '@/app/(frontend)/(pages)/blog/_components/CheckboxInput'
import Icon from '@/components/Icon'
import styles from './index.module.css'

export type TagGroup = {
  key: string
  prefix: string
  label: string
  tags: Tag[]
}

type Props = {
  groups: TagGroup[]
  active: Record<string, string | undefined>
  basePath: string
  query?: string
}

const ORDER = ['gorod-', 'tip-', 'besplatno', 'rekomenduem']

export function sortGroups(groups: TagGroup[]): TagGroup[] {
  return [...groups].sort((a, b) => ORDER.indexOf(a.prefix) - ORDER.indexOf(b.prefix))
}

function buildHref(
  basePath: string,
  query: string | undefined,
  next: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  if (query) params.set('q', query)
  Object.entries(next).forEach(([k, v]) => {
    if (v) params.set(k, v)
  })
  const qs = params.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function CategoryFilters({ groups, active, basePath, query }: Props) {
  const visible = useMemo(() => sortGroups(groups).filter((g) => g.tags.length > 0), [groups])
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Record<string, string | undefined>>(active)
  const router = useRouter()

  useEffect(() => {
    if (open) setDraft(active)
  }, [open, active])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (visible.length === 0) return null

  const hasActive = Object.values(active).some(Boolean)

  const apply = () => {
    router.push(buildHref(basePath, query, draft))
    setOpen(false)
  }

  const reset = () => {
    setDraft({})
    router.push(buildHref(basePath, query, {}))
    setOpen(false)
  }

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen(true)}
        aria-label="Фильтры"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon name="filter" size={18} />
        {hasActive && <span className={styles.dot} aria-hidden />}
      </button>

      {open && (
        <div className={styles.overlay} onClick={() => setOpen(false)}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label="Фильтры"
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.head}>
              <span className={styles.headTitle}>Фильтры</span>
              <button
                type="button"
                className={styles.close}
                onClick={() => setOpen(false)}
                aria-label="Закрыть"
              >
                <Icon name="cross" size={22} />
              </button>
            </div>

            <div className={styles.body}>
              {visible.map((group) => {
                const isCheckbox = group.prefix === 'besplatno' || group.prefix === 'rekomenduem'
                const targetSlug = group.prefix === 'besplatno' ? 'besplatno' : 'rekomenduem'

                if (isCheckbox) {
                  const isChecked = draft[group.key] === targetSlug
                  return (
                    <div key={group.key} className={styles.field}>
                      <CheckboxInput
                        id={`filter-${group.key}`}
                        label={group.label}
                        checked={isChecked}
                        ariaLabel={group.label}
                        onChange={(next) =>
                          setDraft((d) => ({
                            ...d,
                            [group.key]: next ? targetSlug : undefined,
                          }))
                        }
                      />
                    </div>
                  )
                }

                const options = [
                  { label: 'Все' },
                  ...group.tags.map((tag) => ({ value: tag.slug, label: tag.title })),
                ]

                return (
                  <div key={group.key} className={styles.field}>
                    <Select
                      id={`filter-${group.key}`}
                      label={group.label}
                      options={options}
                      value={draft[group.key]}
                      placeholder="Все"
                      ariaLabel={group.label}
                      onSelect={(v) => setDraft((d) => ({ ...d, [group.key]: v }))}
                    />
                  </div>
                )
              })}
            </div>

            <div className={styles.foot}>
              <button type="button" className={styles.applyBtn} onClick={apply}>
                Применить
              </button>
              {hasActive && (
                <button type="button" className={styles.resetBtn} onClick={reset}>
                  Сбросить
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
