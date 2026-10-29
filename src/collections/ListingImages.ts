import type { CollectionConfig } from 'payload'

export const listingImages: CollectionConfig = {
  slug: 'listingImages',
  labels: { singular: 'Фото', plural: 'Фото' },
  admin: { group: 'Объявления', defaultColumns: ['filename', 'ad', 'author', 'order'] },
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
      async ({ req, data }) => {
        if (!req.file?.data) return
        if (!req.file.mimetype?.startsWith('image/')) {
          throw new Error('Допустимы только изображения')
        }
        if (req.file.size > 10 * 1024 * 1024) {
          throw new Error('Максимальный размер файла — 10 МБ')
        }
        if (!data) return
        if (req.user && !data.author) {
          data.author = req.user.id
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
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: false,
      index: true,
      label: 'Автор',
      admin: { readOnly: true },
    },
    { name: 'order', type: 'number', required: true, defaultValue: 0, label: 'Порядок' },
    { name: 'alt', type: 'text', label: 'Alt-текст' },
  ],
}
