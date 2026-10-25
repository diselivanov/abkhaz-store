'use client'

import { useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Tag } from '@/payload-types'
import Icon from '@/components/Icon'
import { CheckboxInput } from '../CheckboxInput'
import styles from './index.module.css'

export type TagGroup = {
  key: string
  prefix: string
  label: string
  tags: Tag[]
}

type Props = {
  groups: TagGroup[]
  basePath: string
}

const ORDER = ['gorod-', 'tip-', 'besplatno', 'rekomenduem']

function sortGroups(groups: TagGroup[]): TagGroup[] {
  return [...groups].sort((a, b) => ORDER.indexOf(a.prefix) - ORDER.indexOf(b.prefix))
}

export function BlogFilters({ groups, basePath }: Props) {
  const visible = useMemo(() => sortGroups(groups).filter((g) => g.tags.length > 0), [groups])
  const router = useRouter()
  const searchParams = useSearchParams()

  if (visible.length === 0) return null

  const updateParam = (key: string, value: string | undefined) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    router.push(qs ? `${basePath}?${qs}` : basePath)
  }

  return (
    <div className={styles.root}>
      {visible.map((group) => {
        const isCheckbox = group.prefix === 'besplatno' || group.prefix === 'rekomenduem'
        const targetSlug = group.prefix === 'besplatno' ? 'besplatno' : 'rekomenduem'
        const current = searchParams.get(group.key) || ''

        if (isCheckbox) {
          return (
            <CheckboxInput
              key={group.key}
              id={`filter-${group.key}`}
              label={group.label}
              checked={current === targetSlug}
              ariaLabel={group.label}
              onChange={(next) => updateParam(group.key, next ? targetSlug : undefined)}
            />
          )
        }

        return (
          <div key={group.key} className={styles.field}>
            <span className={styles.selectWrap}>
              <select
                id={`filter-${group.key}`}
                className={styles.select}
                value={current}
                aria-label={group.label}
                onChange={(e) => updateParam(group.key, e.target.value || undefined)}
              >
                <option value="">{group.label}</option>
                {group.tags.map((tag) => (
                  <option key={tag.id} value={tag.slug}>
                    {tag.title}
                  </option>
                ))}
              </select>
              <Icon name="chevronUpDown" size={14} className={styles.selectIcon} />
            </span>
          </div>
        )
      })}
    </div>
  )
}
