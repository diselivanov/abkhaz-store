import type { CollectionConfig } from 'payload'

export const listingImages: CollectionConfig = {
  slug: 'listingImages',
  labels: { singular: 'Фото', plural: 'Фото' },
  admin: { group: 'Объявления', defaultColumns: ['filename', 'ad', 'order'] },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: 'listing-images',
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  hooks: {
    beforeValidate: [
      async ({ req }) => {
        if (!req.file?.data) return
        if (!req.file.mimetype?.startsWith('image/')) {
          throw new Error('Допустимы только изображения')
        }
        if (req.file.size > 10 * 1024 * 1024) {
          throw new Error('Максимальный размер файла — 10 МБ')
        }
      },
    ],
  },
  fields: [
    {
      name: 'ad',
      type: 'relationship',
      relationTo: 'listingAds',
      required: true,
      index: true,
      label: 'Объявление',
    },
    { name: 'order', type: 'number', required: true, defaultValue: 0, label: 'Порядок' },
    { name: 'alt', type: 'text', label: 'Alt-текст' },
  ],
}
