'use server'

import { headers as nextHeaders } from 'next/headers'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { buildListingSchema } from '@/lib/listings/schemas'
import { getAttributeDef } from '@/lib/listings/attributeSchemas'
import { parseAttributes } from '@/lib/listings/formData'
import { generateUniqueSlug } from '@/lib/listings/slugify'
import { getCategoryBySlug, getSubcategoryBySlug, getCityBySlug } from '@/lib/listings/lookups'
import { removeFilesByFilenames } from '@/lib/listings/files'

export type CreateListingResult = { ok: true; slug: string } | { ok: false; error: string }

const MAX_IMAGES = 10
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function createListingAction(formData: FormData): Promise<CreateListingResult> {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) return { ok: false, error: 'Не авторизован' }

  const priceRaw = formData.get('price')
  const raw = {
    title: String(formData.get('title') || ''),
    categorySlug: String(formData.get('categorySlug') || ''),
    subcategorySlug: String(formData.get('subcategorySlug') || ''),
    citySlug: String(formData.get('citySlug') || ''),
    description: String(formData.get('description') || ''),
    price: priceRaw !== null && priceRaw !== '' ? Number(priceRaw) : undefined,
  }

  const def = getAttributeDef(raw.categorySlug, raw.subcategorySlug)
  const attributesRaw = parseAttributes(formData, def)

  const schema = buildListingSchema(raw.categorySlug, raw.subcategorySlug)
  const parsed = schema.safeParse({
    ...raw,
    attributes: def ? attributesRaw : undefined,
  })

  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Ошибка валидации' }
  }

  const [category, subcategory, city] = await Promise.all([
    getCategoryBySlug(raw.categorySlug),
    getSubcategoryBySlug(raw.subcategorySlug),
    getCityBySlug(raw.citySlug),
  ])

  if (!category) return { ok: false, error: 'Категория не найдена' }
  if (!subcategory) return { ok: false, error: 'Подкатегория не найдена' }
  if (subcategory.category !== category.id) {
    return { ok: false, error: 'Подкатегория не принадлежит выбранной категории' }
  }
  if (!city) return { ok: false, error: 'Город не найден' }

  const images = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0)

  if (images.length < 1) return { ok: false, error: 'Загрузите минимум одно фото' }
  if (images.length > MAX_IMAGES) return { ok: false, error: `Максимум ${MAX_IMAGES} изображений` }

  for (const file of images) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { ok: false, error: 'Допустимы только jpeg, png, webp' }
    }
    if (file.size > MAX_SIZE) {
      return { ok: false, error: 'Размер каждого файла — не более 10 МБ' }
    }
  }

  const slug = await generateUniqueSlug(raw.title)

  const createdFilenames: string[] = []
  const createdImageIds: number[] = []
  let createdAdId: number | null = null

  try {
    const ad = await payload.create({
      collection: 'listingAds',
      data: {
        title: parsed.data.title,
        slug,
        category: category.id,
        subcategory: subcategory.id,
        city: city.id,
        description: parsed.data.description,
        price: parsed.data.price!,
        attributes: def ? attributesRaw : undefined,
        author: user.id,
        status: 'pending',
      },
    })

    createdAdId = ad.id

    for (let i = 0; i < images.length; i += 1) {
      const file = images[i]
      const buffer = Buffer.from(await file.arrayBuffer())

      const img = await payload.create({
        collection: 'listingImages',
        data: {
          ad: ad.id,
          order: i,
          alt: parsed.data.title,
        },
        file: {
          data: buffer,
          mimetype: file.type,
          name: file.name,
          size: file.size,
        },
      })

      createdImageIds.push(img.id)
      if (img.filename) createdFilenames.push(img.filename)
    }

    return { ok: true, slug: ad.slug }
  } catch {
    for (const id of createdImageIds) {
      try {
        await payload.delete({ collection: 'listingImages', id })
      } catch {}
    }
    if (createdAdId !== null) {
      try {
        await payload.delete({ collection: 'listingAds', id: createdAdId })
      } catch {}
    }
    await removeFilesByFilenames(createdFilenames)
    return { ok: false, error: 'Не удалось создать объявление' }
  }
}
