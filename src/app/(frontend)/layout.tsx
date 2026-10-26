import React from 'react'
import type { Metadata } from 'next'
import { Onest } from 'next/font/google'
import { Layout } from '@/components/Layout'
import { JsonLd } from '@/components/JsonLd'
import './styles/globals.css'
import { AlertProvider } from '@/components/AlertProvider'

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-onest',
})

const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(serverUrl),
  title: {
    default: 'Abkhaz Store',
    template: '%s — Abkhaz Store',
  },
  description: 'Открой для себя Абхазию: города, места, пляжи, маршруты и статьи.',
  applicationName: 'Abkhaz Store',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'Abkhaz Store',
    locale: 'ru_RU',
    url: '/',
    title: 'Abkhaz Store',
    description: 'Открой для себя Абхазию: города, места, пляжи, маршруты и статьи.',
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
    <html lang="ru" className={onest.variable}>
      <body>
        <AlertProvider>
          <Layout>{children}</Layout>
        </AlertProvider>
        <JsonLd data={siteLd} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
      (function(m,e,t,r,i,k,a){
          m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
      })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=113769102', 'ym');

      ym(113769102, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
    `,
          }}
        />
        <noscript>
          <div>
            <img
              src="https://mc.yandex.ru/watch/113769102"
              style={{ position: 'absolute', left: '-9999px' }}
              alt=""
            />
          </div>
        </noscript>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-LX3RC11ZLG" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-LX3RC11ZLG');
    `,
          }}
        />
      </body>
    </html>
  )
}
