import type { CollectionConfig } from 'payload'

function lexicalToPlainText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(lexicalToPlainText).join(' ')
  let text = ''
  if (node.text) text += node.text + ' '
  if (node.children) text += lexicalToPlainText(node.children)
  return text
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Статья',
    plural: 'Статьи',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt', 'author'],
    group: 'Блог',
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return { status: { equals: 'published' } }
    },
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  hooks: {
    beforeChange: [
      ({ data, req, operation, originalDoc }) => {
        if (operation === 'create' && req.user && !data.author) {
          data.author = req.user.id
        }
        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date().toISOString()
        }
        if (data.status === 'draft' && originalDoc?.status === 'published') {
          data.publishedAt = null
        }
        if (data.content) {
          const text = lexicalToPlainText(data.content.root)
          const words = text.trim().split(/\s+/).filter(Boolean).length
          data.readingTime = Math.max(1, Math.ceil(words / 200))
        }
        return data
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Основное',
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              label: 'Заголовок',
            },
            {
              name: 'slug',
              type: 'text',
              required: true,
              unique: true,
              label: 'Slug',
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              label: 'Обложка',
            },
            {
              name: 'readingTime',
              type: 'number',
              label: 'Время чтения (мин)',
              admin: {
                readOnly: true,
                hidden: true,
              },
            },
            {
              name: 'categories',
              type: 'relationship',
              relationTo: 'categories',
              hasMany: true,
              label: 'Категории',
            },
            {
              name: 'tags',
              type: 'relationship',
              relationTo: 'tags',
              hasMany: true,
              label: 'Теги',
            },
            {
              name: 'location',
              type: 'text',
              label: 'Координаты (широта, долгота)',
            },
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'users',
              required: true,
              label: 'Автор',
              admin: {
                hidden: true,
              },
            },
            {
              name: 'status',
              type: 'select',
              required: true,
              defaultValue: 'draft',
              label: 'Статус',
              options: [
                { label: 'Черновик', value: 'draft' },
                { label: 'Опубликовано', value: 'published' },
              ],
            },
            {
              name: 'publishedAt',
              type: 'date',
              label: 'Дата публикации',
              admin: {
                hidden: true,
                date: {
                  pickerAppearance: 'dayAndTime',
                },
              },
            },
          ],
        },
        {
          label: 'Контент',
          fields: [
            {
              name: 'content',
              type: 'richText',
              required: true,
              label: 'Контент',
            },
          ],
        },
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: 'SEO',
              fields: [
                {
                  name: 'title',
                  type: 'text',
                  label: 'Заголовок',
                },
                {
                  name: 'description',
                  type: 'textarea',
                  label: 'Описание',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
