import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { buildListingsWhere, getListingsSort, type ListingSort } from '@/lib/listings/search'
import { InfiniteListings } from '@/components/InfiniteListings'
import { ListingFilters } from '@/components/ListingFilters'
import type { CategoryNode } from '@/components/CategoriesModal'
import type { ListingImage } from '@/payload-types'
import styles from './index.module.css'

export const metadata: Metadata = {
  title: 'Доска объявлений Абхазии',
  description: 'Недвижимость, транспорт, работа, услуги и другие товары.',
  alternates: { canonical: '/' },
}

export const revalidate = 0

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function getData(filters: Record<string, string>) {
  const payload = await getPayload({ config })

  const where = buildListingsWhere({
    q: filters.q,
    sort: (filters.sort as ListingSort) || 'new',
  })

  const [{ docs, hasNextPage }, cities, categories, subcategories] = await Promise.all([
    payload.find({
      collection: 'listingAds',
      where,
      sort: getListingsSort((filters.sort as ListingSort) || 'new'),
      limit: 20,
      page: 1,
      depth: 2,
    }),
    payload.find({ collection: 'listingCities', limit: 200, sort: 'order', depth: 0 }),
    payload.find({ collection: 'listingCategories', limit: 200, sort: 'order', depth: 0 }),
    payload.find({ collection: 'listingSubcategories', limit: 500, sort: 'order', depth: 0 }),
  ])

  const categoriesTree: CategoryNode[] = categories.docs.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    subcategories: subcategories.docs
      .filter((s) => {
        const catId = typeof s.category === 'object' ? s.category.id : s.category
        return catId === c.id
      })
      .map((s) => ({ id: s.id, title: s.title, slug: s.slug })),
  }))

  const ids = docs.map((d) => d.id)
  const imagesByAd = new Map<number, ListingImage[]>()
  if (ids.length > 0) {
    const { docs: images } = await payload.find({
      collection: 'listingImages',
      where: { ad: { in: ids } },
      sort: 'order',
      limit: 1000,
      depth: 0,
    })
    for (const img of images) {
      const adId = typeof img.ad === 'object' ? img.ad.id : img.ad
      const list = imagesByAd.get(adId) || []
      list.push(img)
      imagesByAd.set(adId, list)
    }
  }

  return {
    listings: docs.map((d) => ({ ...d, images: imagesByAd.get(d.id) || [] })),
    hasMore: Boolean(hasNextPage),
    cities: cities.docs.map((c) => ({ id: c.id, title: c.title, slug: c.slug })),
    categories: categoriesTree,
  }
}

export default async function HomePage({ searchParams }: Props) {
  const sp = await searchParams
  const filters: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string' && v) filters[k] = v
  }

  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  const data = await getData(filters)

  return (
    <div className={styles.wrapper}>
      <ListingFilters
        cities={data.cities}
        categories={data.categories}
        isAuthenticated={Boolean(user)}
      >
        <h1 className={styles.title}>Все объявления</h1>
        <InfiniteListings
          initialListings={data.listings}
          initialHasMore={data.hasMore}
          query={filters}
        />
      </ListingFilters>
    </div>
  )
}
