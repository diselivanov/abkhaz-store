import { z } from 'zod'
import { getAttributeDef } from './attributeSchemas'

export const listingBaseSchema = z.object({
  title: z
    .string({ message: 'Введите название' })
    .trim()
    .min(3, 'Слишком короткое название')
    .max(120, 'Достигнут лимит символов'),
  categorySlug: z.string({ message: 'Выберите категорию' }).min(1, 'Выберите категорию'),
  subcategorySlug: z.string({ message: 'Выберите подкатегорию' }).min(1, 'Выберите подкатегорию'),
  citySlug: z.string({ message: 'Выберите город' }).min(1, 'Выберите город'),
  description: z
    .string({ message: 'Введите описание' })
    .trim()
    .min(10, 'Слишком короткое описание')
    .max(5000, 'Достигнут лимит символов'),
  price: z
    .number({ message: 'Некорректная цена' })
    .int('Некорректная цена')
    .min(0, 'Некорректная цена'),
})

export type ListingBaseInput = z.infer<typeof listingBaseSchema>

export function buildListingSchema(categorySlug: string, subcategorySlug: string) {
  const def = getAttributeDef(categorySlug, subcategorySlug)

  if (!def) {
    return listingBaseSchema.extend({ attributes: z.object({}).optional() })
  }

  return listingBaseSchema.extend({
    attributes: def.schema,
  })
}

export type ListingInput = z.infer<ReturnType<typeof buildListingSchema>>
