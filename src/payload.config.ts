import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { ru } from 'payload/i18n/ru'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/BlogMedia'
import { Avatars } from './collections/Avatars'
import { Posts } from './collections/BlogPosts'
import { Categories } from './collections/BlogCategories'
import { Tags } from './collections/BlogTags'
import { listingCities } from './collections/ListingCities'
import { listingCategories } from './collections/ListingCategories'
import { listingSubcategories } from './collections/ListingSubcategories'
import { listingAds } from './collections/ListingAds'
import { listingImages } from './collections/ListingImages'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  csrf: [process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'],
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — Abkhaz Store',
    },
  },
  i18n: {
    supportedLanguages: { ru },
    fallbackLanguage: 'ru',
  },
  collections: [
    Users,
    Media,
    Avatars,
    Posts,
    Categories,
    Tags,
    listingCities,
    listingCategories,
    listingSubcategories,
    listingAds,
    listingImages,
  ],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
    push: true,
  }),
  sharp,
  plugins: [],
})
