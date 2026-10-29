import type { FieldMeta } from '@/lib/listings/attributeSchemas'
import styles from './index.module.css'

type Props = {
  description: string
  attributes?: Record<string, unknown> | null
  attributeFields: Record<string, FieldMeta> | null
}

function formatValue(meta: FieldMeta, value: unknown): string {
  if (value === undefined || value === null || value === '') return '—'
  if (meta.type === 'select') {
    const opt = meta.options.find((o) => o.value === String(value))
    return opt?.label || String(value)
  }
  return String(value)
}

export function ListingInfo({ description, attributes, attributeFields }: Props) {
  const entries = attributeFields
    ? Object.entries(attributeFields)
        .map(([key, meta]) => ({
          key,
          label: meta.label,
          value: formatValue(meta, attributes?.[key]),
        }))
        .filter((e) => e.value !== '—')
    : []

  return (
    <div className={styles.root}>
      {entries.length > 0 && (
        <div className={styles.attributes}>
          <h2 className={styles.sectionTitle}>Характеристики</h2>
          <dl className={styles.list}>
            {entries.map((e) => (
              <div key={e.key} className={styles.row}>
                <dt className={styles.dt}>{e.label}</dt>
                <dd className={styles.dd}>{e.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      <div className={styles.description}>
        <h2 className={styles.sectionTitle}>Описание</h2>
        <p className={styles.text}>{description}</p>
      </div>
    </div>
  )
}
