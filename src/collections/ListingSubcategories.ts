import type { CollectionConfig } from 'payload'

export const listingSubcategories: CollectionConfig = {
  slug: 'listingSubcategories',
  labels: { singular: 'Подкатегория', plural: 'Подкатегории' },
  admin: {
    useAsTitle: 'title',
    group: 'Объявления',
    defaultColumns: ['title', 'category', 'order'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'listingCategories',
      required: true,
      index: true,
      label: 'Категория',
    },
    { name: 'title', type: 'text', required: true, label: 'Название' },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'Slug' },
    { name: 'order', type: 'number', required: true, defaultValue: 0, label: 'Порядок' },
  ],
}
