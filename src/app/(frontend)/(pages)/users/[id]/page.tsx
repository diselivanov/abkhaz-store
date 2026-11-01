import type { Metadata } from 'next'
import { headers as nextHeaders } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import { getPayload } from 'payload'
import config from '@/payload.config'
import type { ListingImage, Media } from '@/payload-types'
import { UserHeader } from './_components/UserHeader'
import { UserListingsTabs } from './_components/UserListingsTabs'
import styles from './index.module.css'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

type Props = {
  params: Promise<{ id: string }>
}

async function getUser(id: number) {
  const payload = await getPayload({ config })
  try {
    return await payload.findByID({ collection: 'users', id, depth: 1 })
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const user = await getUser(Number(id))
  if (!user) return {}
  if (user.blockedAt) return {}

  const name = user.name || 'Пользователь'

  return {
    title: `${name} | объявления`,
    description: `Объявления пользователя ${name}.`,
    alternates: { canonical: `${serverUrl}/users/${user.id}` },
  }
}

export default async function UserProfilePage({ params }: Props) {
  const { id } = await params
  const userId = Number(id)
  if (Number.isNaN(userId)) notFound()

  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user: currentUser } = await payload.auth({ headers })

  if (currentUser && currentUser.id === userId) {
    redirect('/profile')
  }

  const user = await getUser(userId)
  if (!user) notFound()

  if (user.blockedAt) {
    redirect('/')
  }

  const avatarUrl = typeof user.avatar === 'object' ? ((user.avatar as Media)?.url ?? null) : null

  const { docs } = await payload.find({
    collection: 'listingAds',
    where: {
      and: [{ author: { equals: user.id } }, { status: { in: ['active', 'completed'] } }],
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
    <div className={styles.wrapper}>
      <div className={styles.root}>
        <UserHeader
          name={user.name || 'Пользователь'}
          phone={user.phone || null}
          whatsapp={user.whatsapp || null}
          telegram={user.telegram || null}
          description={user.description || null}
          avatarUrl={avatarUrl}
          createdAt={user.createdAt}
          userId={user.id}
        />
        <UserListingsTabs listings={listings} />
      </div>
    </div>
  )
}
