import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })

  const [posts, categories, ads, cities, listingCategories, listingSubcategories] =
    await Promise.all([
      payload.find({
        collection: 'posts',
        where: { status: { equals: 'published' } },
        limit: 1000,
        depth: 0,
        select: { slug: true, updatedAt: true, publishedAt: true },
      }),
      payload.find({
        collection: 'categories',
        limit: 1000,
        depth: 0,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'listingAds',
        where: { status: { equals: 'active' } },
        limit: 5000,
        depth: 2,
        select: { slug: true, updatedAt: true, city: true, category: true, subcategory: true },
      }),
      payload.find({
        collection: 'listingCities',
        limit: 100,
        depth: 0,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'listingCategories',
        limit: 100,
        depth: 0,
        select: { slug: true, updatedAt: true },
      }),
      payload.find({
        collection: 'listingSubcategories',
        limit: 1000,
        depth: 1,
        select: { slug: true, updatedAt: true, category: true },
      }),
    ])

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: `${serverUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${serverUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const categoryUrls: MetadataRoute.Sitemap = categories.docs.map((c) => ({
    url: `${serverUrl}/blog/category/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const postUrls: MetadataRoute.Sitemap = posts.docs.map((p) => ({
    url: `${serverUrl}/blog/${p.slug}`,
    lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  const cityUrls: MetadataRoute.Sitemap = cities.docs.map((c) => ({
    url: `${serverUrl}/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const listingCategoryUrls: MetadataRoute.Sitemap = listingCategories.docs.map((c) => ({
    url: `${serverUrl}/${c.slug}`,
    lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  const listingSubcategoryUrls: MetadataRoute.Sitemap = listingSubcategories.docs
    .map((s) => {
      const cat = typeof s.category === 'object' ? s.category : null
      if (!cat) return null

      return {
        url: `${serverUrl}/${cat.slug}/${s.slug}`,
        lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
      }
    })
    .filter((url): url is NonNullable<typeof url> => url !== null)

  const adUrls: MetadataRoute.Sitemap = ads.docs
    .map((ad) => {
      const city = typeof ad.city === 'object' ? ad.city : null
      const category = typeof ad.category === 'object' ? ad.category : null
      const subcategory = typeof ad.subcategory === 'object' ? ad.subcategory : null

      if (!city || !category || !subcategory) return null

      return {
        url: `${serverUrl}/${city.slug}/${category.slug}/${subcategory.slug}/${ad.slug}`,
        lastModified: ad.updatedAt ? new Date(ad.updatedAt) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }
    })
    .filter((url): url is NonNullable<typeof url> => url !== null)

  const cityCategorySubcategoryUrls: MetadataRoute.Sitemap = []
  const seen = new Set<string>()

  for (const ad of ads.docs) {
    const city = typeof ad.city === 'object' ? ad.city : null
    const category = typeof ad.category === 'object' ? ad.category : null
    const subcategory = typeof ad.subcategory === 'object' ? ad.subcategory : null

    if (!city || !category || !subcategory) continue

    const key = `${city.slug}/${category.slug}/${subcategory.slug}`
    if (seen.has(key)) continue
    seen.add(key)

    cityCategorySubcategoryUrls.push({
      url: `${serverUrl}/${key}`,
      lastModified: ad.updatedAt ? new Date(ad.updatedAt) : new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    })
  }

  return [
    ...staticUrls,
    ...categoryUrls,
    ...postUrls,
    ...cityUrls,
    ...listingCategoryUrls,
    ...listingSubcategoryUrls,
    ...cityCategorySubcategoryUrls,
    ...adUrls,
  ]
}
