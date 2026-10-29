import { getPayload } from 'payload'
import config from '@/payload.config'
import type { ListingAd, ListingImage } from '@/payload-types'

export type ListingWithImages = ListingAd & {
  images: ListingImage[]
}

export async function fetchActiveListings(limit = 20): Promise<ListingWithImages[]> {
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'listingAds',
    where: { status: { equals: 'active' } },
    sort: '-createdAt',
    limit,
    depth: 2,
  })

  if (docs.length === 0) return []

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

  return docs.map((d) => ({
    ...d,
    images: byAd.get(d.id) || [],
  }))
}
