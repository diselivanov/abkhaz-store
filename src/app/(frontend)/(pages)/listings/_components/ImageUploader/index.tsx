'use client'

import { useEffect, useMemo, useRef } from 'react'
import { Reorder } from 'motion/react'
import Icon from '@/components/Icon'
import styles from './index.module.css'

export type ImageItem = {
  key: string
  file?: File
  url: string
  id?: number
}

type Props = {
  items: ImageItem[]
  onChange: (items: ImageItem[]) => void
  error?: string
}

const MAX_IMAGES = 10

function DraggableItem({
  item,
  isFirst,
  onRemove,
}: {
  item: ImageItem
  isFirst: boolean
  onRemove: () => void
}) {
  return (
    <Reorder.Item value={item} className={styles.item}>
      <img src={item.url} alt="" className={styles.image} draggable={false} />
      {isFirst && <span className={styles.badge}>Обложка</span>}
      <button type="button" className={styles.remove} onClick={onRemove} aria-label="Удалить">
        <Icon name="cross" size={16} />
      </button>
    </Reorder.Item>
  )
}

export function ImageUploader({ items, onChange, error }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const urlsRef = useRef<string[]>([])

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [])

  const handleFiles = (files: FileList | null) => {
    if (!files) return
    const remaining = MAX_IMAGES - items.length
    const toAdd: ImageItem[] = []
    for (let i = 0; i < files.length && i < remaining; i += 1) {
      const file = files[i]
      if (!file.type.startsWith('image/')) continue
      const url = URL.createObjectURL(file)
      urlsRef.current.push(url)
      toAdd.push({ key: `${Date.now()}-${i}-${file.name}`, file, url })
    }
    if (toAdd.length > 0) onChange([...items, ...toAdd])
    if (inputRef.current) inputRef.current.value = ''
  }

  const removeItem = (key: string) => {
    const target = items.find((i) => i.key === key)
    if (target && target.url.startsWith('blob:')) {
      URL.revokeObjectURL(target.url)
    }
    onChange(items.filter((i) => i.key !== key))
  }

  const count = useMemo(() => items.length, [items])
  const canAdd = count < MAX_IMAGES

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>Фотографии</span>
        {error && <span className={styles.error}>{error}</span>}
      </div>

      <div className={styles.scrollWrap}>
        {items.length > 0 && (
          <Reorder.Group axis="x" values={items} onReorder={onChange} className={styles.list}>
            {items.map((item, index) => (
              <DraggableItem
                key={item.key}
                item={item}
                isFirst={index === 0}
                onRemove={() => removeItem(item.key)}
              />
            ))}
          </Reorder.Group>
        )}

        {canAdd && (
          <button
            type="button"
            className={styles.addTile}
            onClick={() => inputRef.current?.click()}
            aria-label="Добавить фото"
          >
            <Icon name="cross" size={24} className={styles.addIcon} />
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  )
}
