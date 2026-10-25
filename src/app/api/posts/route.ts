import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { fetchBlogPosts } from '@/lib/fetchBlogPosts'

export const revalidate = 0

const FILTER_KEYS = ['gorod', 'tip', 'besplatno', 'rekomenduem'] as const

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const q = searchParams.get('q')?.trim() || ''
  const categorySlug = searchParams.get('category')?.trim() || ''

  const tagSlugs = FILTER_KEYS.map((k) => searchParams.get(k)).filter((v): v is string => !!v)

  let categoryId: number | undefined
  if (categorySlug) {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'categories',
      where: { slug: { equals: categorySlug } },
      limit: 1,
      depth: 0,
    })
    categoryId = docs[0]?.id
    if (!categoryId) {
      return NextResponse.json({ posts: [], hasMore: false })
    }
  }

  const { posts, hasMore } = await fetchBlogPosts({
    page,
    categoryId,
    q,
    tagSlugs,
  })

  return NextResponse.json({ posts, hasMore })
}
