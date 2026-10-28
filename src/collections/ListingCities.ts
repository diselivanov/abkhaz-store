import type { CollectionConfig } from 'payload'

export const listingCities: CollectionConfig = {
  slug: 'listingCities',
  labels: { singular: 'Город', plural: 'Города' },
  admin: { useAsTitle: 'title', group: 'Объявления', defaultColumns: ['title', 'slug', 'order'] },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  defaultSort: 'order',
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'Slug' },
    { name: 'order', type: 'number', required: true, defaultValue: 0, label: 'Порядок' },
  ],
}
