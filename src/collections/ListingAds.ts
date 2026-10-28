import type { CollectionConfig } from 'payload'

export const listingAds: CollectionConfig = {
  slug: 'listingAds',
  labels: { singular: 'Объявление', plural: 'Объявления' },
  admin: {
    useAsTitle: 'title',
    group: 'Объявления',
    defaultColumns: ['title', 'city', 'category', 'status', 'price', 'createdAt'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { author: { equals: user.id } }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return { author: { equals: user.id } }
    },
  },
  defaultSort: '-createdAt',
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Название', maxLength: 120 },
    { name: 'slug', type: 'text', required: true, unique: true, index: true, label: 'Slug' },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'listingCategories',
      required: true,
      index: true,
      label: 'Категория',
    },
    {
      name: 'subcategory',
      type: 'relationship',
      relationTo: 'listingSubcategories',
      required: true,
      index: true,
      label: 'Подкатегория',
    },
    {
      name: 'city',
      type: 'relationship',
      relationTo: 'listingCities',
      required: true,
      index: true,
      label: 'Город',
    },
    { name: 'description', type: 'textarea', required: true, label: 'Описание', maxLength: 5000 },
    { name: 'price', type: 'number', required: true, min: 0, label: 'Цена, ₽' },
    {
      name: 'attributes',
      type: 'json',
      label: 'Характеристики',
      required: false,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      label: 'Автор',
      admin: { readOnly: true },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      label: 'Статус',
      options: [
        { label: 'На модерации', value: 'pending' },
        { label: 'Активное', value: 'active' },
        { label: 'Завершено', value: 'completed' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        if (operation === 'create' && req.user && !data.author) {
          data.author = req.user.id
        }
        if (
          operation === 'update' &&
          originalDoc?.status === 'active' &&
          data.status === undefined
        ) {
          data.status = 'pending'
        }
        return data
      },
    ],
  },
}
