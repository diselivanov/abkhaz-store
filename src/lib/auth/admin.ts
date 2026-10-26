'use server'

import { headers as nextHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'

type Result = { ok: boolean; error?: string }

export async function toggleBlockUserAction(userId: number, block: boolean): Promise<Result> {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })

  const { user } = await payload.auth({ headers })
  if (!user || user.role !== 'admin') return { ok: false, error: 'Недостаточно прав' }
  if (user.id === userId) return { ok: false, error: 'Нельзя заблокировать себя' }

  try {
    await payload.update({
      collection: 'users',
      id: userId,
      data: {
        blockedAt: block ? new Date().toISOString() : null,
      },
      overrideAccess: true,
    })

    if (block) {
      await payload.update({
        collection: 'users',
        id: userId,
        data: { sessions: [] },
        overrideAccess: true,
      })
    }

    revalidatePath('/admin')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Не удалось изменить статус' }
  }
}
