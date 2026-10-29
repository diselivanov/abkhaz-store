import type { Where } from 'payload'
import { getAttributeDef } from './attributeSchemas'

export type ListingSort = 'new' | 'price_asc' | 'price_desc'

export type ListingFiltersInput = {
  q?: string
  city?: string
  category?: string
  subcategory?: string
  sort?: ListingSort
  attributes?: Record<string, string>
}

export function buildListingsWhere(filters: ListingFiltersInput): Where {
  const and: Where[] = [{ status: { equals: 'active' } }, { 'author.blockedAt': { exists: false } }]

  const q = filters.q?.trim()
  if (q) {
    and.push({
      or: [{ title: { contains: q } }, { description: { contains: q } }],
    } as Where)
  }

  if (filters.city) {
    and.push({ 'city.slug': { equals: filters.city } } as Where)
  }

  if (filters.category) {
    and.push({ 'category.slug': { equals: filters.category } } as Where)
  }

  if (filters.subcategory) {
    and.push({ 'subcategory.slug': { equals: filters.subcategory } } as Where)
  }

  if (filters.attributes && filters.category && filters.subcategory) {
    const def = getAttributeDef(filters.category, filters.subcategory)
    if (def) {
      for (const [key, value] of Object.entries(filters.attributes)) {
        const meta = def.fields[key]
        if (!meta || !value) continue
        const fieldPath = `attributes.${key}`
        if (meta.type === 'int' || meta.type === 'number') {
          const n = Number(value)
          if (!Number.isNaN(n)) {
            and.push({ [fieldPath]: { equals: n } } as Where)
          }
        } else if (meta.type === 'select' || meta.type === 'carBrand' || meta.type === 'carModel') {
          and.push({ [fieldPath]: { equals: value } } as Where)
        }
      }
    }
  }

  return { and }
}

export function getListingsSort(sort?: ListingSort): string {
  switch (sort) {
    case 'price_asc':
      return 'price'
    case 'price_desc':
      return '-price'
    case 'new':
    default:
      return '-createdAt'
  }
}
