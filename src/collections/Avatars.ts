import type { CollectionConfig } from 'payload'

export const Avatars: CollectionConfig = {
  slug: 'avatars',
  labels: {
    singular: 'Аватар',
    plural: 'Аватары',
  },
  admin: {
    group: 'Общее',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: 'avatars',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt-текст',
    },
  ],
}
