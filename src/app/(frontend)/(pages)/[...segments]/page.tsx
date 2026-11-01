import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { buildListingsWhere, getListingsSort, type ListingSort } from '@/lib/listings/search'
import { InfiniteListings } from '@/components/InfiniteListings'
import { ListingFilters } from '@/components/ListingFilters'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { getAttributeDef } from '@/lib/listings/attributeSchemas'
import { formatPrice } from '@/lib/listings/format'
import type { CategoryNode } from '@/components/CategoriesModal'
import type { ListingImage } from '@/payload-types'
import styles from './index.module.css'
import { ListingGallery } from './_components/ListingGallery'
import { ListingContacts } from './_components/ListingContacts'
import { ListingInfo } from './_components/ListingInfo'
import { ListingActions } from './_components/ListingActions'

export const revalidate = 0

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

type Props = {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

async function loadTaxonomy() {
  const payload = await getPayload({ config })
  const [cities, categories, subcategories] = await Promise.all([
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

  return {
    cities: cities.docs,
    categories: categories.docs,
    subcategories: subcategories.docs,
    categoriesTree,
  }
}

async function getListings(where: ReturnType<typeof buildListingsWhere>, sort: ListingSort) {
  const payload = await getPayload({ config })
  const { docs, hasNextPage } = await payload.find({
    collection: 'listingAds',
    where,
    sort: getListingsSort(sort),
    limit: 20,
    page: 1,
    depth: 2,
  })

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
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { segments } = await params
  const tax = await loadTaxonomy()

  const clean = (s: string) => (s || '').replace(/\s+/g, ' ').trim()

  const cut = (s: string, n = 160) => {
    const t = clean(s)
    if (t.length <= n) return t
    const slice = t.slice(0, n)
    const lastSpace = slice.lastIndexOf(' ')
    return (lastSpace > 80 ? slice.slice(0, lastSpace) : slice) + '…'
  }

  if (segments.length === 1) {
    const city = tax.cities.find((c) => c.slug === segments[0])
    if (city) {
      return {
        title: `Объявления в ${city.title}: купить и продать`,
        description: `Свежие объявления в ${city.title}: авто, недвижимость, работа, услуги, электроника. Покупайте и продавайте на Abkhaz Store.`,
        alternates: { canonical: `${serverUrl}/${city.slug}` },
      }
    }
    const cat = tax.categories.find((c) => c.slug === segments[0])
    if (cat) {
      const isTransport = cat.slug === 'transport'
      return {
        title: isTransport
          ? `Абхаз Авто: купить и продать в Абхазии`
          : `${cat.title} в Абхазии: объявления`,
        description: isTransport
          ? `Абхаз Авто. Объявления о продаже машин в Абхазии: легковые, внедорожники, спецтехника, мото.`
          : `Объявления в категории «${cat.title}» по всей Абхазии. Покупайте и продавайте на Abkhaz Store.`,
        alternates: { canonical: `${serverUrl}/${cat.slug}` },
      }
    }
    return { robots: { index: false, follow: false } }
  }

  if (segments.length === 2) {
    const [a, b] = segments
    const city = tax.cities.find((c) => c.slug === a)
    const cat1 = tax.categories.find((c) => c.slug === b)
    if (city && cat1) {
      const isTransport = cat1.slug === 'transport'
      return {
        title: isTransport
          ? `Абхаз Авто в ${city.title}`
          : `${cat1.title} в ${city.title}: объявления`,
        description: isTransport
          ? `Абхаз Авто в ${city.title}. Объявления о продаже машин: легковые, внедорожники, спецтехника, мото.`
          : `Объявления в категории «${cat1.title}» в ${city.title}. Покупайте и продавайте на Abkhaz Store.`,
        alternates: { canonical: `${serverUrl}/${city.slug}/${cat1.slug}` },
      }
    }
    const cat2 = tax.categories.find((c) => c.slug === a)
    const sub2 = tax.subcategories.find((s) => s.slug === b)
    if (cat2 && sub2) {
      const isTransport = cat2.slug === 'transport'
      return {
        title: isTransport ? `Абхаз Авто: ${sub2.title}` : `${sub2.title}: ${cat2.title} в Абхазии`,
        description: isTransport
          ? `Абхаз Авто. ${sub2.title} в Абхазии. Объявления с фото и подробностями.`
          : `Объявления «${sub2.title}» в категории «${cat2.title}» по всей Абхазии. С фото и подробностями.`,
        alternates: { canonical: `${serverUrl}/${cat2.slug}/${sub2.slug}` },
      }
    }
    return { robots: { index: false, follow: false } }
  }

  if (segments.length === 3) {
    const city = tax.cities.find((c) => c.slug === segments[0])
    const cat = tax.categories.find((c) => c.slug === segments[1])
    const sub = tax.subcategories.find((s) => s.slug === segments[2])
    if (city && cat && sub) {
      const isTransport = cat.slug === 'transport'
      return {
        title: isTransport
          ? `Абхаз Авто: ${sub.title}, ${city.title}`
          : `${sub.title} в ${city.title}: объявления`,
        description: isTransport
          ? `Абхаз Авто. ${sub.title} в ${city.title}. Объявления с фото и подробностями.`
          : `Объявления «${sub.title}» в ${city.title}. Покупайте и продавайте на Abkhaz Store.`,
        alternates: { canonical: `${serverUrl}/${city.slug}/${cat.slug}/${sub.slug}` },
      }
    }
    return { robots: { index: false, follow: false } }
  }

  if (segments.length === 4) {
    const city = tax.cities.find((c) => c.slug === segments[0])
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'listingAds',
      where: { and: [{ slug: { equals: segments[3] } }] },
      limit: 1,
      depth: 2,
    })
    const ad = docs[0]
    if (!ad) return { robots: { index: false, follow: false } }

    const adAuthorId = typeof ad.author === 'object' ? ad.author.id : ad.author
    try {
      const authorDoc = await payload.findByID({
        collection: 'users',
        id: adAuthorId,
        depth: 0,
      })
      if (authorDoc?.blockedAt) return { robots: { index: false, follow: false } }
    } catch {}

    const price = typeof ad.price === 'number' ? `${ad.price.toLocaleString('ru-RU')} ₽` : ''
    const cityPart = city ? `, ${city.title}` : ', Абхазия'
    const title = `${clean(ad.title)}${price ? ', ' + price : ''}${cityPart}`
    const description = cut(ad.description)

    return {
      title,
      description,
      alternates: { canonical: `${serverUrl}/${segments.join('/')}` },
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${serverUrl}/${segments.join('/')}`,
      },
      robots: { index: true, follow: true },
    }
  }

  return { robots: { index: false, follow: false } }
}

export default async function SegmentsPage({ params, searchParams }: Props) {
  const { segments } = await params
  const sp = await searchParams
  const filters: Record<string, string> = {}
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string' && v) filters[k] = v
  }

  const tax = await loadTaxonomy()
  const sort = (filters.sort as ListingSort) || 'new'
  const payload = await getPayload({ config })

  if (segments.length === 1) {
    const slug = segments[0]
    const city = tax.cities.find((c) => c.slug === slug)
    const category = tax.categories.find((c) => c.slug === slug)
    if (!city && !category) notFound()

    const where = city
      ? buildListingsWhere({ city: slug, q: filters.q, sort, attributes: filters })
      : buildListingsWhere({ category: slug, q: filters.q, sort, attributes: filters })

    const { listings, hasMore } = await getListings(where, sort)
    const heading = city ? `Объявления в городе ${city.title}` : category!.title

    return (
      <div className={styles.outer}>
        <div className={styles.root}>
          <ListingFilters
            cities={tax.cities.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
            categories={tax.categoriesTree}
            currentCity={city?.slug || ''}
            currentCategory={category?.slug || ''}
          >
            <Breadcrumbs
              items={[
                { label: 'Главная', href: '/' },
                { label: city ? city.title : category!.title, href: `/${slug}` },
              ]}
            />
            <h1 className={styles.heading}>{heading}</h1>
            <InfiniteListings
              initialListings={listings}
              initialHasMore={hasMore}
              query={{ ...filters, ...(city ? { city: city.slug } : { category: category!.slug }) }}
            />
          </ListingFilters>
        </div>
      </div>
    )
  }

  if (segments.length === 2) {
    const [a, b] = segments
    const city = tax.cities.find((c) => c.slug === a)
    const catByA = tax.categories.find((c) => c.slug === a)
    const catByB = tax.categories.find((c) => c.slug === b)
    const subByB = tax.subcategories.find((s) => s.slug === b)

    if (city && catByB) {
      const where = buildListingsWhere({
        city: city.slug,
        category: catByB.slug,
        q: filters.q,
        sort,
        attributes: filters,
      })
      const { listings, hasMore } = await getListings(where, sort)

      return (
        <div className={styles.outer}>
          <div className={styles.root}>
            <ListingFilters
              cities={tax.cities.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
              categories={tax.categoriesTree}
              currentCity={city.slug}
              currentCategory={catByB.slug}
            >
              <Breadcrumbs
                items={[
                  { label: 'Главная', href: '/' },
                  { label: city.title, href: `/${city.slug}` },
                  { label: catByB.title, href: `/${city.slug}/${catByB.slug}` },
                ]}
              />
              <h1 className={styles.heading}>
                {catByB.title} в городе {city.title}
              </h1>
              <InfiniteListings
                initialListings={listings}
                initialHasMore={hasMore}
                query={{ ...filters, city: city.slug, category: catByB.slug }}
              />
            </ListingFilters>
          </div>
        </div>
      )
    }

    if (catByA && subByB) {
      const where = buildListingsWhere({
        category: catByA.slug,
        subcategory: subByB.slug,
        q: filters.q,
        sort,
        attributes: filters,
      })
      const { listings, hasMore } = await getListings(where, sort)

      return (
        <div className={styles.outer}>
          <div className={styles.root}>
            <ListingFilters
              cities={tax.cities.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
              categories={tax.categoriesTree}
              currentCategory={catByA.slug}
              currentSubcategory={subByB.slug}
            >
              <Breadcrumbs
                items={[
                  { label: 'Главная', href: '/' },
                  { label: catByA.title, href: `/${catByA.slug}` },
                  { label: subByB.title, href: `/${catByA.slug}/${subByB.slug}` },
                ]}
              />
              <h1 className={styles.heading}>{subByB.title}</h1>
              <InfiniteListings
                initialListings={listings}
                initialHasMore={hasMore}
                query={{ ...filters, category: catByA.slug, subcategory: subByB.slug }}
              />
            </ListingFilters>
          </div>
        </div>
      )
    }

    notFound()
  }

  if (segments.length === 3) {
    const [citySlug, categorySlug, subSlug] = segments
    const city = tax.cities.find((c) => c.slug === citySlug)
    const category = tax.categories.find((c) => c.slug === categorySlug)
    const sub = tax.subcategories.find((s) => s.slug === subSlug)
    if (!city || !category || !sub) notFound()

    const where = buildListingsWhere({
      city: city.slug,
      category: category.slug,
      subcategory: sub.slug,
      q: filters.q,
      sort,
      attributes: filters,
    })
    const { listings, hasMore } = await getListings(where, sort)

    return (
      <div className={styles.outer}>
        <div className={styles.root}>
          <ListingFilters
            cities={tax.cities.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
            categories={tax.categoriesTree}
            currentCity={city.slug}
            currentCategory={category.slug}
            currentSubcategory={sub.slug}
          >
            <Breadcrumbs
              items={[
                { label: 'Главная', href: '/' },
                { label: city.title, href: `/${city.slug}` },
                { label: category.title, href: `/${city.slug}/${category.slug}` },
                { label: sub.title, href: `/${city.slug}/${category.slug}/${sub.slug}` },
              ]}
            />
            <h1 className={styles.heading}>
              {sub.title} в городе {city.title}
            </h1>
            <InfiniteListings
              initialListings={listings}
              initialHasMore={hasMore}
              query={{
                ...filters,
                city: city.slug,
                category: category.slug,
                subcategory: sub.slug,
              }}
            />
          </ListingFilters>
        </div>
      </div>
    )
  }

  if (segments.length === 4) {
    const [citySlug, categorySlug, subSlug, slug] = segments

    const { docs } = await payload.find({
      collection: 'listingAds',
      where: {
        and: [{ slug: { equals: slug } }],
      },
      limit: 1,
      depth: 2,
    })
    const ad = docs[0]
    if (!ad) notFound()

    const reqHeaders = await nextHeaders()
    const { user: currentUser } = await payload.auth({ headers: reqHeaders })
    const authorId = typeof ad.author === 'object' ? ad.author.id : ad.author
    const isAuthor = Boolean(currentUser && currentUser.id === authorId)
    const isAdmin = currentUser?.role === 'admin'

    const authorDoc = await payload.findByID({
      collection: 'users',
      id: authorId,
      depth: 0,
    })
    if (authorDoc?.blockedAt && !isAuthor) {
      redirect('/')
    }

    const city = typeof ad.city === 'object' ? ad.city : null
    const category = typeof ad.category === 'object' ? ad.category : null
    const subcategory = typeof ad.subcategory === 'object' ? ad.subcategory : null

    if (!city || city.slug !== citySlug) notFound()
    if (!category || category.slug !== categorySlug) notFound()
    if (!subcategory || subcategory.slug !== subSlug) notFound()

    const canEdit = Boolean(currentUser && (isAdmin || isAuthor))

    if (ad.status !== 'active' && ad.status !== 'completed' && !canEdit) {
      notFound()
    }

    const { docs: images } = await payload.find({
      collection: 'listingImages',
      where: { ad: { equals: ad.id } },
      sort: 'order',
      limit: 100,
      depth: 0,
    })

    const author = typeof ad.author === 'object' ? ad.author : null
    const attributeDef = getAttributeDef(category.slug, subcategory.slug)
    const url = `${serverUrl}/${segments.join('/')}`

    const jsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Product',
          name: ad.title,
          description: ad.description,
          image: images.map((i) => i.url).filter(Boolean),
          url,
          brand: {
            '@type': 'Brand',
            name: 'Abkhaz Store',
          },
          offers: {
            '@type': 'Offer',
            price: ad.price,
            priceCurrency: 'RUB',
            availability:
              ad.status === 'active' ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
            url,
            seller: author
              ? {
                  '@type': 'Person',
                  name: author.name || 'Пользователь',
                }
              : undefined,
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Главная', item: `${serverUrl}/` },
            {
              '@type': 'ListItem',
              position: 2,
              name: city.title,
              item: `${serverUrl}/${city.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: category.title,
              item: `${serverUrl}/${city.slug}/${category.slug}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: subcategory.title,
              item: `${serverUrl}/${city.slug}/${category.slug}/${subcategory.slug}`,
            },
            { '@type': 'ListItem', position: 5, name: ad.title, item: url },
          ],
        },
      ],
    }
    return (
      <div className={styles.detailWrapper}>
        <article className={styles.detail}>
          <Breadcrumbs
            items={[
              { label: 'Главная', href: '/' },
              { label: city.title, href: `/${city.slug}` },
              { label: category.title, href: `/${city.slug}/${category.slug}` },
              {
                label: subcategory.title,
                href: `/${city.slug}/${category.slug}/${subcategory.slug}`,
              },
              { label: ad.title, href: `/${segments.join('/')}` },
            ]}
          />

          <div className={styles.detailLayout}>
            <div className={styles.detailLeft}>
              <div className={styles.detailGallery}>
                <ListingGallery
                  images={images}
                  title={ad.title}
                  shareUrl={`/${segments.join('/')}`}
                  actions={
                    canEdit ? (
                      <ListingActions
                        adId={ad.id}
                        status={ad.status}
                        editHref={`/listings/${ad.slug}/edit`}
                      />
                    ) : undefined
                  }
                />
              </div>
              <div className={styles.detailHead}>
                <ListingContacts
                  author={author}
                  createdAt={ad.createdAt}
                  title={ad.title}
                  price={formatPrice(ad.price)}
                  city={city.title}
                />
              </div>
              <div className={styles.detailInfo}>
                <ListingInfo
                  description={ad.description}
                  attributes={ad.attributes as Record<string, unknown> | null | undefined}
                  attributeFields={attributeDef?.fields || null}
                />
              </div>
            </div>
            <aside className={styles.detailRight}>
              <ListingContacts
                author={author}
                createdAt={ad.createdAt}
                title={ad.title}
                price={formatPrice(ad.price)}
                city={city.title}
              />
            </aside>
          </div>

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        </article>
      </div>
    )
  }

  notFound()
}
