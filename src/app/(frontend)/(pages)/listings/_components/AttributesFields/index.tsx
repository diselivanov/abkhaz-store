'use client'

import type { FieldMeta } from '@/lib/listings/attributeSchemas'
import { Input } from '@/components/Input'
import { Select } from '@/components/Select'
import { SearchSelect, type SearchSelectOption } from '@/components/SearchSelect'
import styles from './index.module.css'

type Props = {
  fields: Record<string, FieldMeta>
  register: (name: string) => Record<string, unknown>
  errors: Record<string, { message?: string } | undefined>
  values: Record<string, unknown>
  setValue: (name: string, value: unknown) => void
  carBrandOptions: SearchSelectOption[]
  carBrandLoading: boolean
  carModelOptions: SearchSelectOption[]
  carModelLoading: boolean
  onBrandChange: (value: string) => void
}

export function AttributesFields({
  fields,
  register,
  errors,
  values,
  setValue,
  carBrandOptions,
  carBrandLoading,
  carModelOptions,
  carModelLoading,
  onBrandChange,
}: Props) {
  return (
    <section className={styles.root}>
      <h2 className={styles.title}>Характеристики</h2>

      <div className={styles.list}>
        {Object.entries(fields).map(([key, meta]) => {
          const name = `attributes.${key}`
          const error = errors[name]?.message
          const current = String(values[key] ?? '')

          if (meta.type === 'select') {
            return (
              <Select
                key={key}
                id={name}
                label={meta.label}
                value={current}
                onChange={(v) => setValue(name, v)}
                options={meta.options.map((o) => ({ value: o.value, label: o.label }))}
                error={error}
              />
            )
          }

          if (meta.type === 'carBrand') {
            return (
              <SearchSelect
                key={key}
                id={name}
                label={meta.label}
                value={current}
                onChange={(v) => {
                  setValue(name, v)
                  onBrandChange(v)
                }}
                options={carBrandOptions}
                loading={carBrandLoading}
                error={error}
              />
            )
          }

          if (meta.type === 'carModel') {
            return (
              <SearchSelect
                key={key}
                id={name}
                label={meta.label}
                value={current}
                onChange={(v) => setValue(name, v)}
                options={carModelOptions}
                loading={carModelLoading}
                disabled={!values['brand']}
                error={error}
              />
            )
          }

          return (
            <Input
              key={key}
              id={name}
              type={meta.type === 'number' ? 'number' : 'text'}
              label={meta.label}
              step={meta.type === 'number' ? 'any' : undefined}
              min={(meta as { min?: number }).min}
              max={(meta as { max?: number }).max}
              {...register(name)}
              error={error}
            />
          )
        })}
      </div>
    </section>
  )
}
