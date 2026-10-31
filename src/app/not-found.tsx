import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Страница не найдена',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
        background: 'var(--bg)',
        userSelect: 'none',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          maxWidth: '420px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '76px',
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-4px',
            background: 'linear-gradient(135deg, var(--btn) 0%, var(--white) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          404
        </div>

        <h1
          style={{
            margin: 0,
            fontSize: 'var(--fs-xl)',
            fontWeight: 'var(--fw)',
            color: 'var(--fg)',
            letterSpacing: '-0.3px',
          }}
        >
          Страница не найдена
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: 'var(--fs-main)',
            lineHeight: 1.5,
            color: 'var(--fg-secondary)',
          }}
        >
          Возможно, она была удалена или вы перешли по неверной ссылке.
        </p>
      </div>
    </div>
  )
}
