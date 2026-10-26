import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  admin: {
    useAsTitle: 'email',
    group: 'Общее',
    components: {
      edit: {
        beforeDocumentControls: ['@/components/admin/BlockUserButton#BlockUserButton'],
      },
    },
  },
  auth: {
    cookies: {
      sameSite: 'Lax',
      secure: false,
    },
  },
  access: {
    admin: ({ req: { user } }) => user?.role === 'admin',
    create: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.id) return { id: { equals: user.id } }
      return false
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      if (user?.id) return { id: { equals: user.id } }
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Отображаемое имя',
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'avatars',
      label: 'Аватар',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      label: 'Роль',
      options: [
        { label: 'Администратор', value: 'admin' },
        { label: 'Пользователь', value: 'user' },
      ],
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'blockedAt',
      type: 'date',
      label: 'Заблокирован',
      admin: {
        hidden: true,
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
      access: {
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
  ],
}
