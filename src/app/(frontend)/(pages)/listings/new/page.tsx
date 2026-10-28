import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { ListingForm } from '../_components/ListingForm'

export const metadata: Metadata = {
  title: 'Новое объявление',
  robots: { index: false, follow: false },
}

export default async function NewListingPage() {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/sign-in')

  const [categories, subcategories, cities] = await Promise.all([
    payload.find({ collection: 'listingCategories', limit: 200, sort: 'order', depth: 0 }),
    payload.find({ collection: 'listingSubcategories', limit: 500, sort: 'order', depth: 0 }),
    payload.find({ collection: 'listingCities', limit: 200, sort: 'order', depth: 0 }),
  ])

  return (
    <ListingForm
      mode="create"
      categories={categories.docs.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
      subcategories={subcategories.docs.map((s) => {
        const catId = typeof s.category === 'object' ? s.category.id : s.category
        return { id: s.id, title: s.title, slug: s.slug, categoryId: catId }
      })}
      cities={cities.docs.map((c) => ({ id: c.id, title: c.title, slug: c.slug }))}
    />
  )
}
