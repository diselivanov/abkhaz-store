import Link from 'next/link'
import Image from 'next/image'
import type { Post, Media, Category } from '@/payload-types'
import styles from './index.module.css'

type Props = {
  post: Post
  priority?: boolean
}

function lexicalToPlainText(node: any): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(lexicalToPlainText).join(' ')
  let text = ''
  if (node.text) text += node.text + ' '
  if (node.children) text += lexicalToPlainText(node.children)
  return text
}

function getPreview(content: any, limit = 160): string {
  const text = lexicalToPlainText(content?.root).replace(/\s+/g, ' ').trim()
  if (text.length <= limit) return text
  return text.slice(0, limit).replace(/\s+\S*$/, '') + '…'
}

export function PostCard({ post, priority = false }: Props) {
  const cover = typeof post.cover === 'object' ? (post.cover as Media) : null
  const category =
    Array.isArray(post.categories) && post.categories.length > 0
      ? typeof post.categories[0] === 'object'
        ? (post.categories[0] as Category)
        : null
      : null

  return (
    <Link href={`/blog/${post.slug}`} className={styles.card}>
      <div className={styles.media}>
        {cover?.url ? (
          <Image
            src={cover.url.replace(/^https?:\/\/[^/]+/, '')}
            alt={cover.alt || post.title}
            width={cover.width || 800}
            height={cover.height || 450}
            className={styles.cover}
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
          />
        ) : (
          <div className={styles.cover} />
        )}
        {category && <span className={styles.badge}>{category.title}</span>}
      </div>

      <div className={styles.body}>
        <h2 className={styles.title}>{post.title}</h2>
        {post.content && <p className={styles.excerpt}>{getPreview(post.content)}</p>}
      </div>
    </Link>
  )
}
