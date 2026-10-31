'use client'

import { useEffect, useMemo, useState } from 'react'
import { Select } from '@/components/Select'
import { SearchSelect } from '@/components/SearchSelect'
import type { FieldMeta } from '@/lib/listings/attributeSchemas'

type Props = {
  fields: Record<string, FieldMeta>
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  categorySlug: string
  subcategorySlug: string
}

export function AttributesFilter({ fields, values, onChange }: Props) {
  const [carBrandOptions, setCarBrandOptions] = useState<{ value: string; label: string }[]>([])
  const [carModelOptions, setCarModelOptions] = useState<{ value: string; label: string }[]>([])
  const [carBrandLoading, setCarBrandLoading] = useState(false)
  const [carModelLoading, setCarModelLoading] = useState(false)

  const hasCarBrand = useMemo(() => 'brand' in fields, [fields])
  const hasCarModel = useMemo(() => 'model' in fields, [fields])

  useEffect(() => {
    if (!hasCarBrand) return
    setCarBrandLoading(true)
    fetch('/api/cars')
      .then((r) => r.json())
      .then((data: { brands: { id: string; name: string }[] }) => {
        setCarBrandOptions(data.brands.map((b) => ({ value: b.id, label: b.name })))
      })
      .catch(() => setCarBrandOptions([]))
      .finally(() => setCarBrandLoading(false))
  }, [hasCarBrand])

  useEffect(() => {
    if (!hasCarModel) return
    const brand = values['brand']
    if (!brand) {
      setCarModelOptions([])
      return
    }
    setCarModelLoading(true)
    fetch(`/api/cars?brand=${encodeURIComponent(brand)}`)
      .then((r) => r.json())
      .then((data: { models: { id: string; name: string }[] }) => {
        setCarModelOptions(data.models.map((m) => ({ value: m.id, label: m.name })))
      })
      .catch(() => setCarModelOptions([]))
      .finally(() => setCarModelLoading(false))
  }, [hasCarModel, values['brand']])

  const entries = useMemo(
    () => Object.entries(fields).filter(([, meta]) => meta.type === 'select'),
    [fields],
  )

  return (
    <>
      {hasCarBrand && (
        <SearchSelect
          id="filter-brand"
          value={values['brand'] || ''}
          onChange={(v) => onChange('brand', v)}
          options={carBrandOptions}
          label="Марка"
        />
      )}

      {hasCarModel && (
        <SearchSelect
          id="filter-model"
          value={values['model'] || ''}
          onChange={(v) => onChange('model', v)}
          options={carModelOptions}
          label="Модель"
          disabled={!values['brand'] || carModelLoading}
        />
      )}

      {entries.map(([key, meta]) => {
        if (meta.type !== 'select') return null
        return (
          <Select
            key={key}
            id={`filter-${key}`}
            value={values[key] || ''}
            onChange={(v) => onChange(key, v)}
            options={meta.options.map((o) => ({ value: o.value, label: o.label }))}
            label={meta.label}
          />
        )
      })}
    </>
  )
}
