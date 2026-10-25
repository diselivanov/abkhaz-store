import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogIndex } from './_components/BlogIndex'
import { BlogFilters, type TagGroup } from './_components/BlogFilters'
import { JsonLd } from '@/components/JsonLd'
import { fetchBlogPosts } from '@/lib/fetchBlogPosts'
import type { Tag } from '@/payload-types'

export const revalidate = 60

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const FILTER_KEYS = [
  { key: 'gorod', prefix: 'gorod-', label: 'Все города' },
  { key: 'tip', prefix: 'tip-', label: 'Все места' },
  { key: 'besplatno', prefix: 'besplatno', label: 'Бесплатный вход' },
  { key: 'rekomenduem', prefix: 'rekomenduem', label: 'Рекомендуем' },
]

type Props = {
  searchParams: Promise<{
    q?: string
    gorod?: string
    tip?: string
    besplatno?: string
    rekomenduem?: string
  }>
}

export async function generateMetadata() {
  return {
    title: 'Блог об Абхазии — города, пляжи, достопримечательности',
    description:
      'Гид по Абхазии: обзоры городов, пляжи, исторические места и маршруты. Полезные статьи с фото, картами и советами для путешественников.',
    alternates: { canonical: '/blog' },
    openGraph: {
      title: 'Блог об Абхазии — города, пляжи и достопримечательности',
      description:
        'Обзоры городов, пляжей и исторических мест Абхазии. Фото, карты и советы для путешественников.',
      type: 'website',
      url: '/blog',
    },
  }
}

export default async function BlogPage({ searchParams }: Props) {
  const sp = await searchParams
  const query = sp.q?.trim() || ''

  const active: Record<string, string | undefined> = {
    gorod: sp.gorod,
    tip: sp.tip,
    besplatno: sp.besplatno,
    rekomenduem: sp.rekomenduem,
  }

  const tagSlugs = Object.values(active).filter((v): v is string => !!v)

  const { posts, hasMore } = await fetchBlogPosts({ page: 1, q: query, tagSlugs })

  const payload = await getPayload({ config })

  const { docs: categories } = await payload.find({
    collection: 'categories',
    limit: 100,
    sort: 'title',
  })

  const { docs: allTags } = await payload.find({
    collection: 'tags',
    limit: 500,
  })

  const groups: TagGroup[] = FILTER_KEYS.map(({ key, prefix, label }) => ({
    key,
    prefix,
    label,
    tags: (allTags as Tag[]).filter((t) => t.slug.startsWith(prefix)),
  }))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'Блог',
    url: `${serverUrl}/blog`,
    blogPost: posts.map((post) => ({
      '@type': 'BlogPosting',
      headline: post.title,
      url: `${serverUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt,
    })),
  }

  return (
    <>
      <BlogIndex
        posts={posts}
        categories={categories}
        hasMore={hasMore}
        query={query}
        heading="Все категории"
        searchAction="/blog"
        filters={<BlogFilters groups={groups} basePath="/blog" />}
        apiFilters={active}
      />
      <JsonLd data={jsonLd} />
    </>
  )
}
