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

export type UpdateListingResult = { ok: true; slug: string } | { ok: false; error: string }

const MAX_IMAGES = 10
const MAX_SIZE = 10 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

type ExistingImage = { id: number; order: number }

export async function updateListingAction(
  adId: number,
  formData: FormData,
): Promise<UpdateListingResult> {
  const headers = await nextHeaders()
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers })

  if (!user) return { ok: false, error: 'Не авторизован' }

  const existing = await payload.findByID({
    collection: 'listingAds',
    id: adId,
    depth: 0,
  })

  if (!existing) return { ok: false, error: 'Объявление не найдено' }

  const authorId = typeof existing.author === 'object' ? existing.author.id : existing.author
  if (user.role !== 'admin' && authorId !== user.id) {
    return { ok: false, error: 'Недостаточно прав' }
  }

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

  let existingImages: ExistingImage[] = []
  try {
    const rawExisting = formData.get('existingImages')
    if (typeof rawExisting === 'string' && rawExisting) {
      existingImages = JSON.parse(rawExisting)
    }
  } catch {
    return { ok: false, error: 'Ошибка данных изображений' }
  }

  const newImages = formData
    .getAll('images')
    .filter((f): f is File => f instanceof File && f.size > 0)

  const totalImages = existingImages.length + newImages.length
  if (totalImages < 1) return { ok: false, error: 'Загрузите минимум одно фото' }
  if (totalImages > MAX_IMAGES) return { ok: false, error: `Максимум ${MAX_IMAGES} изображений` }

  for (const file of newImages) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { ok: false, error: 'Допустимы только jpeg, png, webp' }
    }
    if (file.size > MAX_SIZE) {
      return { ok: false, error: 'Размер каждого файла — не более 10 МБ' }
    }
  }

  const currentImages = await payload.find({
    collection: 'listingImages',
    where: { ad: { equals: adId } },
    limit: 100,
    depth: 0,
  })

  const keepIds = new Set(existingImages.map((e) => e.id))
  const toDelete = currentImages.docs.filter((img) => !keepIds.has(img.id))
  const deleteFilenames = toDelete.map((img) => img.filename).filter((f): f is string => !!f)

  const createdFilenames: string[] = []
  const createdImageIds: number[] = []

  const slug = await generateUniqueSlug(raw.title, adId)

  try {
    await payload.update({
      collection: 'listingAds',
      id: adId,
      data: {
        title: parsed.data.title,
        slug,
        category: category.id,
        subcategory: subcategory.id,
        city: city.id,
        description: parsed.data.description,
        price: parsed.data.price!,
        attributes: def ? attributesRaw : undefined,
        status: 'pending',
      },
    })

    for (const { id, order } of existingImages) {
      await payload.update({
        collection: 'listingImages',
        id,
        data: { order },
      })
    }

    const baseOrder = existingImages.length
    for (let i = 0; i < newImages.length; i += 1) {
      const file = newImages[i]
      const buffer = Buffer.from(await file.arrayBuffer())

      const img = await payload.create({
        collection: 'listingImages',
        data: {
          ad: adId,
          order: baseOrder + i,
          alt: parsed.data.title,
          author: authorId,
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

    for (const img of toDelete) {
      await payload.delete({ collection: 'listingImages', id: img.id })
    }

    await removeFilesByFilenames(deleteFilenames)

    return { ok: true, slug }
  } catch {
    for (const id of createdImageIds) {
      try {
        await payload.delete({ collection: 'listingImages', id })
      } catch {}
    }
    await removeFilesByFilenames(createdFilenames)
    return { ok: false, error: 'Не удалось обновить объявление' }
  }
}
