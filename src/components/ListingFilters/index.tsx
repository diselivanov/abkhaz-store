'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Icon from '@/components/Icon'
import { FilterSelect } from '@/components/FilterSelect'
import { Button } from '@/components/Button'
import type { CategoryNode } from '@/components/CategoriesModal'
import { CategoriesModal } from '@/components/CategoriesModal'
import { getAttributeDef } from '@/lib/listings/attributeSchemas'
import { AttributesFilter } from '@/components/AttributesFilter'
import styles from './index.module.css'

type CityOption = { id: number; title: string; slug: string }

type Props = {
  cities: CityOption[]
  categories: CategoryNode[]
  currentCity?: string
  currentCategory?: string
  currentSubcategory?: string
  isAuthenticated?: boolean
  children: React.ReactNode
}

const SORT_OPTIONS = [
  { value: 'new', label: 'Сначала новые' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
]

const PLACEHOLDERS = [
  'Снять квартиру посуточно',
  'BMW M5 F90',
  'iPhone 15 128 ГБ',
  'Купить квартиру',
  'Работа в офисе',
  'Аренда авто',
  'Дом у моря',
  'Toyota Camry',
  'Ноутбук для работы',
  'Экскурсии в Абхазии',
  'Ремонт квартиры',
  'Mercedes-Benz E-Class',
  'Посуточная аренда',
  'Детская коляска',
]

export function ListingFilters({
  cities,
  categories,
  currentCity = '',
  currentCategory = '',
  currentSubcategory = '',
  isAuthenticated = false,
  children,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')

  const [focused, setFocused] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const [placeholderText, setPlaceholderText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '')
  }, [searchParams])

  useEffect(() => {
    if (searchValue || focused) return

    const current = PLACEHOLDERS[placeholderIdx]
    let timeoutId: ReturnType<typeof setTimeout>

    if (!isDeleting && placeholderText === current) {
      timeoutId = setTimeout(() => setIsDeleting(true), 2000)
    } else if (isDeleting && placeholderText === '') {
      setIsDeleting(false)
      setPlaceholderIdx((prev) => (prev + 1) % PLACEHOLDERS.length)
    } else {
      timeoutId = setTimeout(
        () => {
          setPlaceholderText((prev) =>
            isDeleting ? prev.slice(0, -1) : current.slice(0, prev.length + 1),
          )
        },
        isDeleting ? 30 : 70,
      )
    }

    return () => clearTimeout(timeoutId)
  }, [placeholderText, isDeleting, placeholderIdx, searchValue, focused])

  const cityOptions = [
    { value: 'all', label: 'Все' },
    ...cities.map((c) => ({ value: c.slug, label: c.title })),
  ]

  const attributeDef =
    currentCategory && currentSubcategory
      ? getAttributeDef(currentCategory, currentSubcategory)
      : null

  const attributeValues: Record<string, string> = {}
  if (attributeDef) {
    for (const key of Object.keys(attributeDef.fields)) {
      const v = searchParams.get(key)
      if (v) attributeValues[key] = v
    }
  }

  const updateQuery = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())

    if (updates.brand !== undefined && updates.brand !== searchParams.get('brand')) {
      params.delete('model')
    }

    for (const [k, v] of Object.entries(updates)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateQuery({ q: searchValue.trim() || undefined })
  }

  const onSearchClear = () => {
    setSearchValue('')
    updateQuery({ q: undefined })
  }

  const onCategorySelect = (categorySlug: string, subcategorySlug: string) => {
    setCategoriesOpen(false)
    if (currentCity) {
      router.push(`/${currentCity}/${categorySlug}/${subcategorySlug}`)
    } else {
      router.push(`/${categorySlug}/${subcategorySlug}`)
    }
  }

  const onCityChange = (citySlug: string) => {
    if (!citySlug || citySlug === 'all') {
      if (currentCategory && currentSubcategory) {
        router.push(`/${currentCategory}/${currentSubcategory}`)
      } else if (currentCategory) {
        router.push(`/${currentCategory}`)
      } else {
        router.push('/')
      }
      return
    }

    if (currentCategory && currentSubcategory) {
      router.push(`/${citySlug}/${currentCategory}/${currentSubcategory}`)
    } else if (currentCategory) {
      router.push(`/${citySlug}/${currentCategory}`)
    } else {
      router.push(`/${citySlug}`)
    }
  }

  const onReset = () => {
    setSearchValue('')
    router.push(pathname)
  }

  const hasAnyFilter = Array.from(searchParams.keys()).length > 0

  return (
    <>
      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <FilterSelect
            id="filter-city"
            value={currentCity || 'all'}
            onChange={onCityChange}
            options={cityOptions}
            placeholder="Город"
          />

          <FilterSelect
            id="filter-sort"
            value={searchParams.get('sort') || 'new'}
            onChange={(v) => updateQuery({ sort: v === 'new' ? undefined : v })}
            options={SORT_OPTIONS}
            placeholder="Сортировка"
          />

          {attributeDef && (
            <AttributesFilter
              fields={attributeDef.fields}
              values={attributeValues}
              onChange={(key, value) => updateQuery({ [key]: value || undefined })}
              categorySlug={currentCategory}
              subcategorySlug={currentSubcategory}
            />
          )}

          {hasAnyFilter && (
            <Button variant="ghost" size="sm" round onClick={onReset} full>
              Сбросить
            </Button>
          )}
        </aside>

        <div className={styles.content}>
          <div className={styles.searchRow}>
            <Button
              variant="primary"
              size="md"
              round
              onClick={() => setCategoriesOpen((v) => !v)}
              className={styles.categoriesButton}
            >
              <Icon name="layoutGrid" size={18} />
              <span>Категории</span>
            </Button>

            <form className={styles.search} onSubmit={onSearchSubmit}>
              <Icon name="search" size={18} className={styles.searchIcon} />

              {searchValue === '' && !focused && (
                <div className={styles.typedPlaceholder} aria-hidden="true">
                  <span>{placeholderText}</span>
                  <span className={styles.typedCaret} />
                </div>
              )}

              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className={styles.searchInput}
              />
              {searchValue && (
                <button
                  type="button"
                  className={styles.searchClear}
                  onClick={onSearchClear}
                  aria-label="Очистить"
                >
                  <Icon name="cross" size={22} />
                </button>
              )}
            </form>

            <Button
              variant="primary"
              size="md"
              round
              onClick={() => router.push('/listings/new')}
              className={styles.addButton}
            >
              Разместить объявление
            </Button>
          </div>

          {children}
        </div>
      </div>

      <CategoriesModal
        open={categoriesOpen}
        categories={categories}
        onClose={() => setCategoriesOpen(false)}
        onSelect={onCategorySelect}
      />
    </>
  )
}
