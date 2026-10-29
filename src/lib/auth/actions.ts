'use server'

import { cookies, headers as nextHeaders } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getPayload } from 'payload'
import config from '@/payload.config'

export type AuthState = {
  error?: string
  success?: boolean
}

export type UploadAvatarState = {
  error?: string
  success?: boolean
}

export type UpdateProfileResult = { ok: true } | { ok: false; error?: string }

const COOKIE_NAME = 'payload-token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: false,
    maxAge: COOKIE_MAX_AGE,
  })
}

export async function signInAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') || '')

  if (!email || !password) return { error: 'Заполните все поля' }

  const payload = await getPayload({ config })

  try {
    const result = await payload.login({ collection: 'users', data: { email, password } })

    if (result.user?.blockedAt) {
      const cookieStore = await cookies()
      cookieStore.delete(COOKIE_NAME)
      return { error: 'Аккаунт заблокирован' }
    }

    if (result.token) await setAuthCookie(result.token)
    return { success: true }
  } catch {
    return { error: 'Неверный email или пароль' }
  }
}

export async function signUpAction(
  _prev: AuthState | undefined,
  formData: FormData,
): Promise<AuthState> {
  const name = String(formData.get('name') || '').trim()
  const email = String(formData.get('email') || '')
    .trim()
    .toLowerCase()
  const password = String(formData.get('password') || '')

  if (!name || !email || !password) return { error: 'Заполните все поля' }
  if (name.length < 2) return { error: 'Имя слишком короткое' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Некорректный email' }
  if (password.length < 8) return { error: 'Пароль должен быть не короче 8 символов' }

  const payload = await getPayload({ config })

  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    return { error: 'Этот email уже занят' }
  }

  try {
    await payload.create({
      collection: 'users',
      data: { name, email, password, role: 'user' },
    })
    const result = await payload.login({ collection: 'users', data: { email, password } })
    if (result.token) await setAuthCookie(result.token)
    return { success: true }
  } catch {
    return { error: 'Не удалось создать аккаунт' }
  }
}

export async function signOutAction(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export async function uploadAvatarAction(
  _prev: UploadAvatarState | undefined,
  formData: FormData,
): Promise<UploadAvatarState> {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) return { error: 'Не авторизован' }

  const file = formData.get('avatar')
  if (!(file instanceof File) || file.size === 0) {
    return { error: 'Файл не выбран' }
  }
  if (!file.type.startsWith('image/')) {
    return { error: 'Допустимы только изображения' }
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Максимальный размер — 5 МБ' }
  }

  const oldAvatarId =
    typeof user.avatar === 'object' && user.avatar !== null ? user.avatar.id : null

  try {
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const avatar = await payload.create({
      collection: 'avatars',
      data: { alt: `Аватар ${user.name || user.email}` },
      file: {
        data: buffer,
        mimetype: file.type,
        name: file.name,
        size: file.size,
      },
    })

    await payload.update({
      collection: 'users',
      id: user.id,
      data: { avatar: avatar.id },
    })

    if (oldAvatarId) {
      try {
        await payload.delete({
          collection: 'avatars',
          id: oldAvatarId,
        })
      } catch {}
    }

    revalidatePath('/profile')
    revalidatePath('/')
    return { success: true }
  } catch {
    return { error: 'Не удалось загрузить аватар' }
  }
}

export async function updateProfileAction(data: {
  name: string
  phone?: string
}): Promise<UpdateProfileResult> {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) return { ok: false, error: 'Не авторизован' }

  try {
    await payload.update({
      collection: 'users',
      id: user.id,
      data: {
        name: data.name,
        phone: data.phone || null,
      },
    })
    revalidatePath('/profile')
    return { ok: true }
  } catch {
    return { ok: false, error: 'Не удалось сохранить профиль' }
  }
}
