import { z } from 'zod'
import { getAttributeDef } from './attributeSchemas'

export const listingBaseSchema = z.object({
  title: z
    .string({ message: 'Введите название' })
    .trim()
    .min(3, 'Минимум 3 символа')
    .max(120, 'Максимум 120 символов'),
  categorySlug: z.string({ message: 'Выберите категорию' }).min(1, 'Выберите категорию'),
  subcategorySlug: z.string({ message: 'Выберите подкатегорию' }).min(1, 'Выберите подкатегорию'),
  citySlug: z.string({ message: 'Выберите город' }).min(1, 'Выберите город'),
  description: z
    .string({ message: 'Введите описание' })
    .trim()
    .min(20, 'Минимум 20 символов')
    .max(5000, 'Максимум 5000 символов'),
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
