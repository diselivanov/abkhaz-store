import React from 'react'
import type { Metadata } from 'next'
import { Layout } from '@/components/Layout'
import { JsonLd } from '@/components/JsonLd'
import './styles/globals.css'
import { AlertProvider } from '@/components/AlertProvider'

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(serverUrl),
  title: {
    default: 'Abkhaz Store — Доска объявлений Абхазии',
    template: 'Abkhaz Store — %s',
  },
  description:
    'Купить или продать в Абхазии: авто, недвижимость, электроника, работа, услуги, вещи и другие товары.',
  applicationName: 'Abkhaz Store',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Abkhaz Store',
    locale: 'ru_RU',
    url: '/',
    title: 'Abkhaz Store — Доска объявлений Абхазии',
    description:
      'Купить или продать в Абхазии: авто, недвижимость, электроника, работа, услуги, вещи и другие товары.',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
}

const siteLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${serverUrl}/#organization`,
      name: 'Abkhaz Store',
      url: serverUrl,
      logo: `${serverUrl}/favicon.ico`,
    },
    {
      '@type': 'WebSite',
      '@id': `${serverUrl}/#website`,
      url: serverUrl,
      name: 'Abkhaz Store',
      inLanguage: 'ru',
      publisher: { '@id': `${serverUrl}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${serverUrl}/blog?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
  ],
}

export default function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="ru">
      <body>
        <AlertProvider>
          <Layout>{children}</Layout>
        </AlertProvider>
        <JsonLd data={siteLd} />
      </body>
    </html>
  )
}
