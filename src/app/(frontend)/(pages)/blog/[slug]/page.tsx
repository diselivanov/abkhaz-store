import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { RichText, defaultJSXConverters } from '@payloadcms/richtext-lexical/react'
import type { Category, Media, Post, User } from '@/payload-types'
import { JsonLd } from '@/components/JsonLd'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PostHero } from './_components/PostHero'
import { RelatedPosts } from './_components/RelatedPosts'
import styles from './index.module.css'

export const revalidate = 60

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

type Props = {
  params: Promise<{ slug: string }>
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = d.getDate()
  const month = d.toLocaleDateString('ru-RU', { month: 'long' })
  const year = d.getFullYear()
  return `${day} ${month} ${year}`
}

async function getPost(slug: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [{ slug: { equals: slug } }, { status: { equals: 'published' } }],
    },
    limit: 1,
    depth: 2,
  })
  return docs[0] ?? null
}

async function getRelatedPosts(post: Post): Promise<Post[]> {
  const firstCategory = Array.isArray(post.categories) ? post.categories[0] : null
  if (!firstCategory) return []

  const categoryId = typeof firstCategory === 'object' ? firstCategory.id : firstCategory
  if (typeof categoryId !== 'number') return []

  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'posts',
    where: {
      and: [
        { status: { equals: 'published' } },
        { categories: { in: [categoryId] } },
        { id: { not_equals: post.id } },
      ],
    },
    limit: 200,
    depth: 2,
  })

  const currentTags = new Set<number>(
    (Array.isArray(post.tags) ? post.tags : [])
      .map((t) => (typeof t === 'object' ? t.id : t))
      .filter((v): v is number => typeof v === 'number'),
  )

  const scored = docs.map((p) => {
    const tags = Array.isArray(p.tags) ? p.tags : []
    const score = tags.reduce<number>((acc, t) => {
      const id = typeof t === 'object' ? t.id : t
      return acc + (typeof id === 'number' && currentTags.has(id) ? 1 : 0)
    }, 0)
    return { post: p, score }
  })

  const byTags = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.post)

  const byTagsIds = new Set(byTags.map((p) => p.id))

  const fallback = docs.filter((p) => !byTagsIds.has(p.id)).sort(() => Math.random() - 0.5)

  const merged = [...byTags, ...fallback].slice(0, 12)

  return merged.sort(() => Math.random() - 0.5)
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post) return {}

  const title = post.seo?.title || post.title
  const description = post.seo?.description || undefined
  const cover = typeof post.cover === 'object' ? (post.cover as Media) : null
  const ogImage = cover?.url || undefined

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt || undefined,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) notFound()

  const author = typeof post.author === 'object' ? (post.author as User) : null
  const cover = typeof post.cover === 'object' ? (post.cover as Media) : null
  const categories = Array.isArray(post.categories)
    ? post.categories.filter((c): c is Category => typeof c === 'object')
    : []

  const related = await getRelatedPosts(post)

  const date = post.publishedAt ? formatDate(post.publishedAt) : null

  const converters = {
    ...defaultJSXConverters,
    upload: ({ node }: any) => {
      const media = node.value as Media
      if (!media?.url) return null
      return (
        <figure className={styles.contentFigure}>
          <img
            src={media.url}
            alt={media.alt || ''}
            width={media.width || undefined}
            height={media.height || undefined}
          />
          {media.alt && <figcaption>{media.alt}</figcaption>}
        </figure>
      )
    },
  }

  const coverImage = cover?.url
    ? {
        '@type': 'ImageObject',
        url: cover.url,
        width: cover.width || undefined,
        height: cover.height || undefined,
        caption: cover.alt || post.title,
      }
    : undefined

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seo?.description || undefined,
    image: coverImage,
    datePublished: post.publishedAt || undefined,
    dateModified: post.updatedAt,
    publisher: {
      '@type': 'Organization',
      '@id': `${serverUrl}/#organization`,
      name: 'Abkhaz Store',
      logo: {
        '@type': 'ImageObject',
        url: `${serverUrl}/favicon.ico`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${serverUrl}/blog/${post.slug}`,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Главная', item: `${serverUrl}/` },
        { '@type': 'ListItem', position: 2, name: 'Блог', item: `${serverUrl}/blog` },
        ...(categories.length > 0
          ? [
              {
                '@type': 'ListItem',
                position: 3,
                name: categories[0].title,
                item: `${serverUrl}/blog/category/${categories[0].slug}`,
              },
            ]
          : []),
        {
          '@type': 'ListItem',
          position: categories.length > 0 ? 4 : 3,
          name: post.title,
          item: `${serverUrl}/blog/${post.slug}`,
        },
      ],
    },
  }

  const itemListLd =
    related.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: 'Похожие статьи',
          itemListElement: related.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: `${serverUrl}/blog/${p.slug}`,
            name: p.title,
          })),
        }
      : null

  return (
    <article className={styles.root}>
      <div className={styles.breadcrumbs}>
        <Breadcrumbs
          items={[
            { label: 'Главная', href: '/' },
            { label: 'Блог', href: '/blog' },
            ...(categories.length > 0
              ? [{ label: categories[0].title, href: `/blog/category/${categories[0].slug}` }]
              : []),
            { label: post.title },
          ]}
        />
      </div>

      <div className={styles.hero}>
        <PostHero
          title={post.title}
          cover={cover}
          author={author}
          date={date}
          publishedAt={post.publishedAt || null}
          readingTime={post.readingTime || 1}
          location={post.location}
          shareUrl={`/blog/${post.slug}`}
        />
      </div>

      <div className={styles.content}>
        <RichText data={post.content} converters={converters} />
      </div>

      <div className={styles.related}>
        <RelatedPosts posts={related} />
      </div>

      <div className={styles.scripts}>
        <JsonLd data={jsonLd} />
        {itemListLd && <JsonLd data={itemListLd} />}
      </div>
    </article>
  )
}
