import Link from 'next/link'
import type { Post, Category } from '@/payload-types'
import { SearchInput } from '../SearchInput'
import { InfinitePosts } from '../InfinitePosts'
import styles from './index.module.css'

type Props = {
  posts: Post[]
  categories: Category[]
  hasMore: boolean
  query?: string
  activeCategorySlug?: string
  heading: string
  searchAction: string
  hiddenCategory?: string
  filters?: React.ReactNode
  apiFilters?: {
    gorod?: string
    tip?: string
    besplatno?: string
    rekomenduem?: string
  }
}

export function BlogIndex({
  posts,
  categories,
  hasMore,
  query,
  activeCategorySlug,
  heading,
  searchAction,
  hiddenCategory,
  filters,
  apiFilters,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.searchRow}>
          <SearchInput defaultValue={query} action={searchAction} hiddenCategory={hiddenCategory} />
          {filters}
        </div>

        {categories.length > 0 && (
          <nav className={styles.categories} aria-label="Категории">
            <Link
              href="/blog"
              className={`${styles.categoryLink} ${
                !activeCategorySlug ? styles.categoryActive : ''
              }`}
            >
              Все категории
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/blog/category/${cat.slug}`}
                className={`${styles.categoryLink} ${
                  activeCategorySlug === cat.slug ? styles.categoryActive : ''
                }`}
              >
                {cat.title}
              </Link>
            ))}
          </nav>
        )}
      </header>

      <main className={styles.content}>
        <h1 className={styles.title}>{heading}</h1>

        {posts.length === 0 ? (
          <p className={styles.empty}>
            {query ? `Ничего не найдено по запросу «${query}»` : 'Пока нет статей'}
          </p>
        ) : (
          <InfinitePosts
            initialPosts={posts}
            initialHasMore={hasMore}
            categorySlug={activeCategorySlug}
            q={query}
            filters={apiFilters}
          />
        )}
      </main>
    </div>
  )
}