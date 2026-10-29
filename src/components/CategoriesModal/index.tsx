'use client'

import { useEffect, useState } from 'react'
import Icon, { type IconName } from '@/components/Icon'
import styles from './index.module.css'

export type CategoryNode = {
  id: number
  title: string
  slug: string
  subcategories: { id: number; title: string; slug: string }[]
}

const CATEGORY_ICONS: Record<string, IconName> = {
  nedvizhimost: 'realEstate',
  'arenda-zhilya': 'rentHousing',
  transport: 'transport',
  'zapchasti-i-aksessuary': 'autoParts',
  elektronika: 'electronics',
  rabota: 'work',
  uslugi: 'services',
  zhivotnye: 'animals',
  'dlya-doma-i-dachi': 'homeGarden',
  'lichnye-veschi': 'personalItems',
  'hobbi-i-otdyh': 'hobby',
  'biznes-i-oborudovanie': 'business',
}

type Props = {
  open: boolean
  categories: CategoryNode[]
  onClose: () => void
  onSelect: (categorySlug: string, subcategorySlug: string) => void
}

export function CategoriesModal({ open, categories, onClose, onSelect }: Props) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [mobileSubcategoryOpen, setMobileSubcategoryOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setActiveId(categories[0]?.id ?? null)
    setMobileSubcategoryOpen(false)
  }, [open, categories])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (mobileSubcategoryOpen) setMobileSubcategoryOpen(false)
        else onClose()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, mobileSubcategoryOpen])

  if (!open) return null

  const active = categories.find((c) => c.id === activeId) || null

  const onCategoryClick = (cat: CategoryNode) => {
    setActiveId(cat.id)
    setMobileSubcategoryOpen(true)
  }

  const onSubcategoryClick = (subSlug: string) => {
    if (!active) return
    onSelect(active.slug, subSlug)
    setMobileSubcategoryOpen(false)
  }

  return (
    <div className={styles.root}>
      <div className={styles.overlay} onClick={onClose} />

      <div className={styles.panel}>
        {mobileSubcategoryOpen ? (
          <div className={styles.mobilePanel}>
            <div className={styles.mobileHeader}>
              <button
                type="button"
                className={styles.mobileBack}
                onClick={() => setMobileSubcategoryOpen(false)}
                aria-label="Назад"
              >
                <Icon name="chevronLeft" size={20} />
              </button>
              <span className={styles.mobileTitle}>Подкатегория</span>
              <button
                type="button"
                className={styles.mobileClose}
                onClick={onClose}
                aria-label="Закрыть"
              >
                <Icon name="cross" size={20} />
              </button>
            </div>
            <ul className={styles.mobileSubs}>
              {active && active.subcategories.length > 0 ? (
                active.subcategories.map((sub) => (
                  <li
                    key={sub.id}
                    className={styles.mobileSubItem}
                    onClick={() => onSubcategoryClick(sub.slug)}
                  >
                    {sub.title}
                  </li>
                ))
              ) : (
                <li className={styles.empty}>Нет подкатегорий</li>
              )}
            </ul>
          </div>
        ) : (
          <div className={styles.mobilePanel}>
            <div className={styles.mobileHeader}>
              <span className={styles.mobileSpacer} />
              <span className={styles.mobileTitle}>Категории</span>
              <button
                type="button"
                className={styles.mobileClose}
                onClick={onClose}
                aria-label="Закрыть"
              >
                <Icon name="cross" size={20} />
              </button>
            </div>
            <ul className={styles.mobileSubs}>
              {categories.map((cat) => (
                <li
                  key={cat.id}
                  className={styles.mobileSubItem}
                  onClick={() => onCategoryClick(cat)}
                >
                  <span className={styles.mobileSubLeft}>
                    <Icon
                      name={CATEGORY_ICONS[cat.slug] || 'layoutGrid'}
                      size={20}
                      className={styles.catIcon}
                    />
                    <span>{cat.title}</span>
                  </span>
                  <Icon name="chevronRight" size={16} className={styles.catArrow} />
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={`${styles.columns} ${styles.desktopOnly}`}>
          <ul className={styles.categories}>
            {categories.map((cat) => {
              const isActive = cat.id === activeId
              return (
                <li
                  key={cat.id}
                  className={`${styles.catItem} ${isActive ? styles.catActive : ''}`}
                  onMouseEnter={() => setActiveId(cat.id)}
                >
                  <span className={styles.catLeft}>
                    <Icon
                      name={CATEGORY_ICONS[cat.slug] || 'layoutGrid'}
                      size={20}
                      className={styles.catIcon}
                    />
                    <span className={styles.catTitle}>{cat.title}</span>
                  </span>
                  <Icon name="chevronRight" size={16} className={styles.catArrow} />
                </li>
              )
            })}
          </ul>

          <ul className={styles.subcategories}>
            {active && active.subcategories.length > 0 ? (
              active.subcategories.map((sub) => (
                <li
                  key={sub.id}
                  className={styles.subItem}
                  onClick={() => onSelect(active.slug, sub.slug)}
                >
                  {sub.title}
                </li>
              ))
            ) : (
              <li className={styles.empty}>Нет подкатегорий</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
