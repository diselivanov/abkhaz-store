import type { MetadataRoute } from 'next'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/api/media/file/', '/api/avatars/file/', '/api/listingImages/file/'],
        disallow: [
          '/admin',
          '/api',
          '/profile',
          '/sign-in',
          '/sign-up',
          '/listings/new',
          '/listings/*/edit',
        ],
      },
    ],
    sitemap: `${serverUrl}/sitemap.xml`,
    host: serverUrl,
  }
}
