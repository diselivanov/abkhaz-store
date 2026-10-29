import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { ListingImage, Media } from '@/payload-types'
import { ProfileSidebar } from './ProfileSidebar'
import { MyListingsTabs } from './MyListingsTabs'
import styles from './index.module.css'

export const metadata: Metadata = {
  title: 'Мои объявления',
  robots: { index: false, follow: false },
}

export default async function ProfilePage() {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) redirect('/sign-in')

  const avatarUrl = typeof user.avatar === 'object' ? ((user.avatar as Media)?.url ?? null) : null

  const { docs } = await payload.find({
    collection: 'listingAds',
    where: {
      and: [
        { author: { equals: user.id } },
        { status: { in: ['pending', 'active', 'completed'] } },
      ],
    },
    sort: '-createdAt',
    limit: 200,
    depth: 2,
  })

  const ids = docs.map((d) => d.id)
  const imagesByAd = new Map<number, ListingImage[]>()
  if (ids.length > 0) {
    const { docs: images } = await payload.find({
      collection: 'listingImages',
      where: { ad: { in: ids } },
      sort: 'order',
      limit: 2000,
      depth: 0,
    })
    for (const img of images) {
      const adId = typeof img.ad === 'object' ? img.ad.id : img.ad
      const list = imagesByAd.get(adId) || []
      list.push(img)
      imagesByAd.set(adId, list)
    }
  }

  const listings = docs.map((d) => ({ ...d, images: imagesByAd.get(d.id) || [] }))

  return (
    <div className={styles.layout}>
      <ProfileSidebar
        name={user.name || 'Без имени'}
        phone={user.phone || null}
        avatarUrl={avatarUrl}
        createdAt={user.createdAt}
      />
      <div className={styles.content}>
        <MyListingsTabs listings={listings} />
      </div>
    </div>
  )
}
