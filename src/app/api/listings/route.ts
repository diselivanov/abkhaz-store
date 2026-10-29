import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { buildListingsWhere, getListingsSort, type ListingSort } from '@/lib/listings/search'
import type { ListingImage } from '@/payload-types'

export const revalidate = 0

const PER_PAGE = 20

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const q = searchParams.get('q')?.trim() || ''
  const city = searchParams.get('city')?.trim() || ''
  const category = searchParams.get('category')?.trim() || ''
  const subcategory = searchParams.get('subcategory')?.trim() || ''
  const sort = (searchParams.get('sort') as ListingSort) || 'new'

  const attributes: Record<string, string> = {}
  for (const [key, value] of searchParams.entries()) {
    if (['page', 'q', 'city', 'category', 'subcategory', 'sort'].includes(key)) continue
    if (value) attributes[key] = value
  }

  const payload = await getPayload({ config })

  const where = buildListingsWhere({ q, city, category, subcategory, sort, attributes })
  const orderBy = getListingsSort(sort)

  const { docs, hasNextPage } = await payload.find({
    collection: 'listingAds',
    where,
    sort: orderBy,
    limit: PER_PAGE,
    page,
    depth: 2,
  })

  if (docs.length === 0) {
    return NextResponse.json({ listings: [], hasMore: false })
  }

  const ids = docs.map((d) => d.id)
  const { docs: images } = await payload.find({
    collection: 'listingImages',
    where: { ad: { in: ids } },
    sort: 'order',
    limit: 1000,
    depth: 0,
  })

  const byAd = new Map<number, ListingImage[]>()
  for (const img of images) {
    const adId = typeof img.ad === 'object' ? img.ad.id : img.ad
    const list = byAd.get(adId) || []
    list.push(img)
    byAd.set(adId, list)
  }

  const listings = docs.map((d) => ({
    ...d,
    images: byAd.get(d.id) || [],
  }))

  return NextResponse.json({ listings, hasMore: Boolean(hasNextPage) })
}
