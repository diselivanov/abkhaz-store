'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Icon from '@/components/Icon'
import type { ListingImage } from '@/payload-types'
import styles from './index.module.css'

type Props = {
  images: ListingImage[]
  title: string
  actions?: React.ReactNode
}

export function ListingGallery({ images, title, actions }: Props) {
  const [active, setActive] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const thumbsRef = useRef<HTMLDivElement | null>(null)
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  useEffect(() => {
    if (isMobile) return
    const container = thumbsRef.current
    const activeThumb = thumbRefs.current[active]
    if (!container || !activeThumb) return

    const containerWidth = container.clientWidth
    const thumbLeft = activeThumb.offsetLeft
    const thumbWidth = activeThumb.clientWidth

    const scrollLeft = thumbLeft - containerWidth / 2 + thumbWidth / 2

    container.scrollTo({ left: scrollLeft, behavior: 'smooth' })
  }, [active, isMobile])

  if (images.length === 0) return null

  const paginate = (dir: number) => {
    setActive((prev) => {
      let next = prev + dir
      if (next < 0) next = images.length - 1
      if (next >= images.length) next = 0
      return next
    })
  }

  const onScroll = () => {
    if (!isMobile) return
    const el = scrollRef.current
    if (!el) return
    const width = el.clientWidth
    if (width === 0) return
    const idx = Math.round(el.scrollLeft / width)
    if (idx !== active) setActive(idx)
  }

  return (
    <div className={styles.root}>
      <div className={styles.main}>
        {isMobile && images.length > 1 ? (
          <div className={styles.track} ref={scrollRef} onScroll={onScroll}>
            {images.map((img, i) => (
              <div key={img.id} className={styles.slide}>
                {img.url && (
                  <Image
                    src={img.url.replace(/^https?:\/\/[^/]+/, '')}
                    alt={img.alt || title}
                    width={img.width || 1200}
                    height={img.height || 900}
                    className={styles.mainImage}
                    priority={i === 0}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.slider} style={{ transform: `translateX(-${active * 100}%)` }}>
            {images.map((img) => (
              <div key={img.id} className={styles.slide}>
                {img.url && (
                  <Image
                    src={img.url.replace(/^https?:\/\/[^/]+/, '')}
                    alt={img.alt || title}
                    width={img.width || 1200}
                    height={img.height || 900}
                    className={styles.mainImage}
                    priority
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {!isMobile && images.length > 1 && (
          <>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navPrev}`}
              onClick={() => paginate(-1)}
              aria-label="Предыдущее фото"
            >
              <Icon name="chevronLeft" size={20} />
            </button>
            <button
              type="button"
              className={`${styles.navButton} ${styles.navNext}`}
              onClick={() => paginate(1)}
              aria-label="Следующее фото"
            >
              <Icon name="chevronRight" size={20} />
            </button>
          </>
        )}

        {actions && <div className={styles.actions}>{actions}</div>}
      </div>

      {!isMobile && images.length > 1 && (
        <div className={styles.thumbs} ref={thumbsRef}>
          {images.map((img, i) => (
            <button
              key={img.id}
              ref={(el) => {
                thumbRefs.current[i] = el
              }}
              type="button"
              onClick={() => setActive(i)}
              className={`${styles.thumb} ${i === active ? styles.thumbActive : ''}`}
              aria-label={`Фото ${i + 1}`}
            >
              {img.url && (
                <Image
                  src={img.url.replace(/^https?:\/\/[^/]+/, '')}
                  alt=""
                  width={img.width || 200}
                  height={img.height || 150}
                  className={styles.thumbImage}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
