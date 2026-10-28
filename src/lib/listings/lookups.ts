import { getPayload } from 'payload'
import config from '@/payload.config'

export async function getCategoryBySlug(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'listingCategories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

export async function getSubcategoryBySlug(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'listingSubcategories',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}

export async function getCityBySlug(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'listingCities',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  return docs[0] ?? null
}
