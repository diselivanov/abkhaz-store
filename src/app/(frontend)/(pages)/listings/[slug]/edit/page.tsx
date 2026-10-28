import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ListingForm } from '../../_components/ListingForm'

export const metadata: Metadata = {
  title: 'Редактирование объявления',
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ slug: string }>
}

export default async function EditListingPage({ params }: Props) {
  const { slug } = await params
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/sign-in')

  const { docs } = await payload.find({
    collection: 'listingAds',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })

  const ad = docs[0]
  if (!ad) notFound()

  const authorId = typeof ad.author === 'object' ? ad.author.id : ad.author
  if (user.role !== 'admin' && authorId !== user.id) {
    redirect('/')
  }

  const [categories, subcategories, cities, images] = await Promise.all([
    payload.find({ collection: 'listingCategories', limit: 200, sort: 'order', depth: 0 }),
    payload.find({ collection: 'listingSubcategories', limit: 500, sort: 'order', depth: 0 }),
    payload.find({ collection: 'listingCities', limit: 200, sort: 'order', depth: 0 }),
    payload.find({
      collection: 'listingImages',
      where: { ad: { equals: ad.id } },
      limit: 100,
      sort: 'order',
      depth: 0,
    }),
  ])

  const category = typeof ad.category === 'object' ? ad.category : null
  const subcategory = typeof ad.subcategory === 'object' ? ad.subcategory : null
  const city = typeof ad.city === 'object' ? ad.city : null

  return (
    <ListingForm
      mode="edit"
      adId={ad.id}
      categories={categories.docs.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
      subcategories={subcategories.docs.map((s) => {
        const catId = typeof s.category === 'object' ? s.category.id : s.category
        return { id: s.id, title: s.title, slug: s.slug, categoryId: catId }
      })}
      cities={cities.docs.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
      initialValues={{
        title: ad.title,
        categorySlug: category?.slug || '',
        subcategorySlug: subcategory?.slug || '',
        citySlug: city?.slug || '',
        description: ad.description,
        price: String(ad.price),
        attributes: (ad.attributes as Record<string, unknown>) || {},
      }}
      initialImages={images.docs.map((img) => ({
        id: img.id,
        order: img.order,
        url: img.url || '',
      }))}
    />
  )
}
