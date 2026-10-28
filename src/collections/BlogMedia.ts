import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Фото',
    plural: 'Фото',
  },
  admin: {
    group: 'Блог',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      label: 'Alt-текст',
    },
  ],
  upload: true,
}
