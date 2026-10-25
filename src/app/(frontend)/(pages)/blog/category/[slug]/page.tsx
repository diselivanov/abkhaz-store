import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { BlogIndex } from '../../_components/BlogIndex'
import { BlogFilters, type TagGroup } from '../../_components/BlogFilters'
import { JsonLd } from '@/components/JsonLd'
import { fetchBlogPosts } from '@/lib/fetchBlogPosts'
import type { Tag } from '@/payload-types'

export const revalidate = 300

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const FILTER_KEYS = [
  { key: 'gorod', prefix: 'gorod-', label: 'Все города' },
  { key: 'tip', prefix: 'tip-', label: 'Все места' },
  { key: 'besplatno', prefix: 'besplatno', label: 'Бесплатный вход' },
  { key: 'rekomenduem', prefix: 'rekomenduem', label: 'Рекомендуем' },
]

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    q?: string
    gorod?: string
    tip?: string
    besplatno?: string
    rekomenduem?: string
  }>
}

async function getCategory(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'categories',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params, searchParams }: Props) {
  const { slug } = await params
  const { q } = await searchParams
  const query = q?.trim() || ''

  const category = await getCategory(slug)
  if (!category) return {}

  const title = category.title
  const description = `Статьи об Абхазии в категории «${category.title}».`

  const metadata: any = {
    title,
    description,
    alternates: { canonical: `/blog/category/${category.slug}` },
    openGraph: {
      title,
      description,
      type: 'website',
      url: `/blog/category/${category.slug}`,
    },
  }

  if (query) {
    metadata.robots = { index: false, follow: true }
  }

  return metadata
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params
  const sp = await searchParams

  const category = await getCategory(slug)
  if (!category) notFound()

  const query = sp.q?.trim() || ''

  const active: Record<string, string | undefined> = {
    gorod: sp.gorod,
    tip: sp.tip,
    besplatno: sp.besplatno,
    rekomenduem: sp.rekomenduem,
  }

  const tagSlugs = Object.values(active).filter((v): v is string => !!v)

  const { posts, hasMore } = await fetchBlogPosts({
    page: 1,
    categoryId: category.id,
    q: query,
    tagSlugs,
  })

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
    '@type': 'CollectionPage',
    name: category.title,
    url: `${serverUrl}/blog/category/${category.slug}`,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${serverUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: `${serverUrl}/blog` },
        {
          '@type': 'ListItem',
          position: 3,
          name: category.title,
          item: `${serverUrl}/blog/category/${category.slug}`,
        },
      ],
    },
  }

  return (
    <>
      <BlogIndex
        posts={posts}
        categories={categories}
        hasMore={hasMore}
        query={query}
        activeCategorySlug={category.slug}
        heading={category.title}
        searchAction={`/blog/category/${category.slug}`}
        filters={<BlogFilters groups={groups} basePath={`/blog/category/${category.slug}`} />}
        apiFilters={active}
      />
      <JsonLd data={jsonLd} />
    </>
  )
}
