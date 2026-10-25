import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Post } from '@/payload-types'

export const PER_PAGE = 30

export type BlogFilters = {
  page?: number
  categoryId?: number
  q?: string
  tagSlugs?: string[]
}

export type BlogResult = {
  posts: Post[]
  hasMore: boolean
}

export async function fetchBlogPosts({
  page = 1,
  categoryId,
  q,
  tagSlugs = [],
}: BlogFilters): Promise<BlogResult> {
  const payload = await getPayload({ config })

  const where: any = {
    and: [{ status: { equals: 'published' } }],
  }
  if (typeof categoryId === 'number') {
    where.and.push({ categories: { in: [categoryId] } })
  }
  const query = q?.trim()
  if (query) {
    where.and.push({ title: { contains: query } })
  }

  const activeSlugs = tagSlugs.filter((v): v is string => !!v)
  if (activeSlugs.length > 0) {
    let allowedIds: number[] | null = null
    let broken = false

    for (const slug of activeSlugs) {
      const { docs: tagDocs } = await payload.find({
        collection: 'tags',
        where: { slug: { equals: slug } },
        limit: 1,
      })
      const tag = tagDocs[0]
      if (!tag) {
        broken = true
        break
      }

      const baseAnd: any[] = [{ status: { equals: 'published' } }]
      if (typeof categoryId === 'number') {
        baseAnd.push({ categories: { in: [categoryId] } })
      }
      baseAnd.push({ tags: { in: [tag.id] } })
      if (allowedIds) baseAnd.push({ id: { in: allowedIds } })

      const { docs: postDocs } = await payload.find({
        collection: 'posts',
        where: { and: baseAnd },
        limit: 1000,
        depth: 0,
        pagination: false,
      })

      allowedIds = postDocs.map((p) => p.id)
      if (allowedIds.length === 0) break
    }

    where.and.push({ id: { in: broken ? [] : (allowedIds ?? []) } })
  }

  const { docs: posts, hasNextPage } = await payload.find({
    collection: 'posts',
    where,
    sort: '-publishedAt',
    limit: PER_PAGE,
    page,
    depth: 2,
  })

  return { posts, hasMore: Boolean(hasNextPage) }
}