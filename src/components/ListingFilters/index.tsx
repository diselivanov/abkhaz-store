'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Icon from '@/components/Icon'
import { Button } from '@/components/Button'
import { Select } from '@/components/Select'
import type { CategoryNode } from '@/components/CategoriesModal'
import { CategoriesModal } from '@/components/CategoriesModal'
import { AttributesFilter } from '@/components/AttributesFilter'
import { getAttributeDef } from '@/lib/listings/attributeSchemas'
import type { FieldMeta } from '@/lib/listings/attributeSchemas'
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

const PLACEHOLDER = 'Искать на Abkhaz Store'

export function ListingFilters({
  cities,
  categories,
  currentCity = '',
  currentCategory = '',
  currentSubcategory = '',
  children,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('q') || '')
  const reduce = useReducedMotion()

  const [draftCity, setDraftCity] = useState(currentCity || 'all')
  const [draftSort, setDraftSort] = useState(searchParams.get('sort') || 'new')
  const [draftAttrs, setDraftAttrs] = useState<Record<string, string>>({})

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    setSearchValue(searchParams.get('q') || '')
  }, [searchParams])

  const attributeDef: { fields: Record<string, FieldMeta> } | null = useMemo(
    () =>
      currentCategory && currentSubcategory
        ? getAttributeDef(currentCategory, currentSubcategory)
        : null,
    [currentCategory, currentSubcategory],
  )

  const attributeValues: Record<string, string> = useMemo(() => {
    if (!attributeDef) return {}
    const values: Record<string, string> = {}
    for (const key of Object.keys(attributeDef.fields)) {
      const v = searchParams.get(key)
      if (v) values[key] = v
    }
    return values
  }, [attributeDef, searchParams])

  useEffect(() => {
    if (!filtersOpen) return
    setDraftCity(currentCity || 'all')
    setDraftSort(searchParams.get('sort') || 'new')
    setDraftAttrs(attributeValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersOpen])

  useEffect(() => {
    if (!filtersOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFiltersOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [filtersOpen])

  const cityOptions = useMemo(
    () => [
      { value: 'all', label: 'Все города' },
      ...cities.map((c) => ({ value: c.slug, label: c.title })),
    ],
    [cities],
  )

  const buildPath = (
    city: string,
    category = currentCategory,
    subcategory = currentSubcategory,
  ) => {
    if (!city || city === 'all') {
      if (category && subcategory) return `/${category}/${subcategory}`
      if (category) return `/${category}`
      return '/'
    }
    if (category && subcategory) return `/${city}/${category}/${subcategory}`
    if (category) return `/${city}/${category}`
    return `/${city}`
  }

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    const q = searchValue.trim()
    if (q) params.set('q', q)
    else params.delete('q')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const onSearchClear = () => {
    setSearchValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  const onCategorySelect = (categorySlug: string, subcategorySlug: string) => {
    setCategoriesOpen(false)
    if (currentCity) {
      router.push(`/${currentCity}/${categorySlug}/${subcategorySlug}`)
    } else {
      router.push(`/${categorySlug}/${subcategorySlug}`)
    }
  }

  const hasAnyDraftFilter =
    (draftCity && draftCity !== 'all') ||
    draftSort !== 'new' ||
    Object.values(draftAttrs).some(Boolean)

  const onResetDraft = () => {
    setDraftCity('all')
    setDraftSort('new')
    setDraftAttrs({})

    const params = new URLSearchParams(searchParams.toString())
    params.delete('sort')
    if (attributeDef) {
      for (const key of Object.keys(attributeDef.fields)) params.delete(key)
    }

    const cityChanged = (currentCity || 'all') !== 'all'
    const targetPath = cityChanged ? buildPath('all') : pathname

    const qs = params.toString()
    setFiltersOpen(false)
    router.push(qs ? `${targetPath}?${qs}` : targetPath)
  }

  const onApplyFilters = () => {
    const cityChanged = draftCity !== (currentCity || 'all')
    const targetPath = cityChanged ? buildPath(draftCity) : pathname

    const params = new URLSearchParams(searchParams.toString())
    if (draftSort && draftSort !== 'new') params.set('sort', draftSort)
    else params.delete('sort')

    if (attributeDef) {
      for (const key of Object.keys(attributeDef.fields)) params.delete(key)
    }
    for (const [k, v] of Object.entries(draftAttrs)) {
      if (v) params.set(k, v)
    }

    const qs = params.toString()
    setFiltersOpen(false)
    router.push(qs ? `${targetPath}?${qs}` : targetPath)
  }

  const filtersModal = mounted ? (
    <AnimatePresence>
      {filtersOpen && (
        <>
          <motion.div
            className={styles.modalOverlay}
            onClick={() => setFiltersOpen(false)}
            initial={isMobile || reduce ? false : { opacity: 0 }}
            animate={reduce ? undefined : { opacity: 1 }}
            exit={isMobile || reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          />
          <motion.div
            className={styles.modalRoot}
            initial={isMobile || reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={reduce ? undefined : { opacity: 1, scale: 1 }}
            exit={isMobile || reduce ? undefined : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <div className={styles.modalPanel}>
              <div className={styles.modalHeader}>
                <button
                  type="button"
                  className={styles.modalClose}
                  onClick={() => setFiltersOpen(false)}
                  aria-label="Закрыть"
                >
                  <Icon name="cross" size={18} />
                </button>
                <span className={styles.modalTitle}>Фильтры</span>
                {hasAnyDraftFilter ? (
                  <button type="button" className={styles.modalReset} onClick={onResetDraft}>
                    Сбросить
                  </button>
                ) : (
                  <span className={styles.modalSpacer} />
                )}
              </div>

              <div className={styles.modalBody}>
                <Select
                  id="modal-filter-city"
                  value={draftCity}
                  onChange={setDraftCity}
                  options={cityOptions}
                  label="Город"
                />

                <Select
                  id="modal-filter-sort"
                  value={draftSort}
                  onChange={setDraftSort}
                  options={SORT_OPTIONS}
                  label="Сортировка"
                />

                {attributeDef && (
                  <AttributesFilter
                    fields={attributeDef.fields}
                    values={draftAttrs}
                    onChange={(key, value) =>
                      setDraftAttrs((prev) => {
                        const next = { ...prev, [key]: value }
                        if (key === 'brand') next.model = ''
                        return next
                      })
                    }
                    categorySlug={currentCategory}
                    subcategorySlug={currentSubcategory}
                  />
                )}
              </div>

              <div className={styles.modalFooter}>
                <Button variant="primary" size="md" full onClick={onApplyFilters}>
                  Показать результаты
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  ) : null

  return (
    <>
      <div className={styles.layout}>
        <div className={styles.content}>
          <div className={styles.searchRow}>
            <Button
              variant="primary"
              size="md"
              round
              onClick={() => setCategoriesOpen((v) => !v)}
              className={`${styles.categoriesButton}`}
              aria-label="Категории"
            >
              <Icon name="layoutGrid" size={20} />
              Категории
            </Button>

            <div className={styles.searchAndFilter}>
              <form className={styles.search} onSubmit={onSearchSubmit}>
                <Icon name="search" size={18} className={styles.searchIcon} />

                <input
                  type="text"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={PLACEHOLDER}
                  className={styles.searchInput}
                />

                <div className={styles.searchActions}>
                  {searchValue && (
                    <button
                      type="button"
                      className={styles.searchClear}
                      onClick={onSearchClear}
                      aria-label="Очистить"
                    >
                      <Icon name="cross" size={18} />
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.searchFilter}
                    onClick={() => setFiltersOpen(true)}
                    aria-label="Фильтры"
                  >
                    <Icon name="filter" size={20} />
                  </button>
                </div>
              </form>
            </div>

            <Button
              variant="primary"
              size="md"
              round
              onClick={() => router.push('/listings/new')}
              className={styles.addButton}
            >
              Разместить объявление
            </Button>

            <button
              type="button"
              onClick={() => setCategoriesOpen(true)}
              className={styles.mobileCategoriesButton}
              aria-label="Категории"
            >
              <Icon name="menu" size={24} />
            </button>
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

      {mounted && createPortal(filtersModal, document.body)}
    </>
  )
}
