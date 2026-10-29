'use server'

import { headers as nextHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'

type Status = 'pending' | 'active' | 'completed'
type Result = { ok: true } | { ok: false; error: string }

export async function updateListingStatusAction(adId: number, nextStatus: Status): Promise<Result> {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) return { ok: false, error: 'Не авторизован' }

  const ad = await payload.findByID({ collection: 'listingAds', id: adId, depth: 0 })
  if (!ad) return { ok: false, error: 'Объявление не найдено' }

  const authorId = typeof ad.author === 'object' ? ad.author.id : ad.author
  if (user.role !== 'admin' && authorId !== user.id) {
    return { ok: false, error: 'Недостаточно прав' }
  }

  try {
    await payload.update({
      collection: 'listingAds',
      id: adId,
      data: { status: nextStatus },
    })
    revalidatePath('/profile')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Не удалось обновить статус' }
  }
}
