'use client'

import { useEffect, useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/Input'
import { Textarea } from '@/components/Textarea'
import { Select } from '@/components/Select'
import { Button } from '@/components/Button'
import { useAlert } from '@/components/AlertProvider'
import { getAttributeDef } from '@/lib/listings/attributeSchemas'
import { listingBaseSchema } from '@/lib/listings/schemas'
import { createListingAction } from '@/actions/listings/createListing'
import { updateListingAction } from '@/actions/listings/updateListing'
import type { SearchSelectOption } from '@/components/SearchSelect'
import { AttributesFields } from '../AttributesFields'
import { ImageUploader, type ImageItem } from '../ImageUploader'
import styles from './index.module.css'

export type CategoryOption = { id: number; title: string; slug: string }
export type SubcategoryOption = { id: number; title: string; slug: string; categoryId: number }
export type CityOption = { id: number; title: string; slug: string }

type ExistingImage = { id: number; order: number; url: string }

type Props = {
  mode: 'create' | 'edit'
  adId?: number
  categories: CategoryOption[]
  subcategories: SubcategoryOption[]
  cities: CityOption[]
  initialValues?: {
    title: string
    categorySlug: string
    subcategorySlug: string
    citySlug: string
    description: string
    price: string
    attributes: Record<string, unknown>
  }
  initialImages?: ExistingImage[]
}

const formSchema = listingBaseSchema.extend({
  price: z.any(),
  attributes: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

export function ListingForm({
  mode,
  adId,
  categories,
  subcategories,
  cities,
  initialValues,
  initialImages = [],
}: Props) {
  const router = useRouter()
  const alert = useAlert()
  const [pending, startTransition] = useTransition()

  const [images, setImages] = useState<ImageItem[]>(() =>
    initialImages
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((img) => ({ key: `existing-${img.id}`, id: img.id, url: img.url })),
  )

  const [carBrandOptions, setCarBrandOptions] = useState<SearchSelectOption[]>([])
  const [carModelOptions, setCarModelOptions] = useState<SearchSelectOption[]>([])
  const [carBrandLoading, setCarBrandLoading] = useState(false)
  const [carModelLoading, setCarModelLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialValues?.title || '',
      categorySlug: initialValues?.categorySlug || '',
      subcategorySlug: initialValues?.subcategorySlug || '',
      citySlug: initialValues?.citySlug || '',
      description: initialValues?.description || '',
      price: initialValues?.price || '',
      attributes: initialValues?.attributes || {},
    },
  })

  const values = watch()

  const categorySlug = values.categorySlug
  const subcategorySlug = values.subcategorySlug
  const citySlug = values.citySlug
  const attributesValues = (values.attributes || {}) as Record<string, unknown>
  const brandValue = attributesValues.brand as string | undefined

  const filteredSubcategories = useMemo(() => {
    const cat = categories.find((c) => c.slug === categorySlug)
    if (!cat) return []
    return subcategories.filter((s) => s.categoryId === cat.id)
  }, [categories, subcategories, categorySlug])

  const attributeDef = useMemo(
    () => (categorySlug && subcategorySlug ? getAttributeDef(categorySlug, subcategorySlug) : null),
    [categorySlug, subcategorySlug],
  )

  useEffect(() => {
    if (!categorySlug) return
    const cat = categories.find((c) => c.slug === categorySlug)
    if (!cat) return
    const sub = subcategories.find((s) => s.slug === subcategorySlug)
    if (!sub || sub.categoryId !== cat.id) {
      setValue('subcategorySlug', '')
    }
  }, [categorySlug])

  useEffect(() => {
    const hasCarBrand = attributeDef && 'brand' in attributeDef.fields
    if (!hasCarBrand) return
    setCarBrandLoading(true)
    fetch('/api/cars')
      .then((r) => r.json())
      .then((data: { brands: { id: string; name: string }[] }) => {
        setCarBrandOptions(data.brands.map((b) => ({ value: b.id, label: b.name })))
      })
      .catch(() => setCarBrandOptions([]))
      .finally(() => setCarBrandLoading(false))
  }, [attributeDef])

  useEffect(() => {
    if (!attributeDef || !('model' in attributeDef.fields)) return
    if (!brandValue) {
      setCarModelOptions([])
      return
    }
    setCarModelLoading(true)
    fetch(`/api/cars?brand=${encodeURIComponent(brandValue)}`)
      .then((r) => r.json())
      .then((data: { models: { id: string; name: string }[] }) => {
        setCarModelOptions(data.models.map((m) => ({ value: m.id, label: m.name })))
      })
      .catch(() => setCarModelOptions([]))
      .finally(() => setCarModelLoading(false))
  }, [attributeDef, brandValue])

  const handleBrandChange = () => {
    setValue('attributes.model', '')
  }

  const onSubmit = (data: FormValues) => {
    if (images.length < 1) {
      alert.error('Минимум 1 изображение')
      return
    }

    const formData = new FormData()
    formData.set('title', data.title)
    formData.set('categorySlug', data.categorySlug)
    formData.set('subcategorySlug', data.subcategorySlug)
    formData.set('citySlug', data.citySlug)
    formData.set('description', data.description)

    if (data.price !== '' && data.price !== undefined && data.price !== null) {
      formData.set('price', String(data.price))
    }

    const attrs = (data.attributes || {}) as Record<string, unknown>

    if (attributeDef) {
      Object.entries(attributeDef.fields).forEach(([key]) => {
        const v = attrs[key]
        if (v !== undefined && v !== null && v !== '') {
          formData.set(key, String(v))
        }
      })
    }

    const existingPayload: { id: number; order: number }[] = []
    const newFiles: File[] = []
    images.forEach((img, index) => {
      if (img.id) {
        existingPayload.push({ id: img.id, order: index })
      } else if (img.file) {
        newFiles.push(img.file)
      }
    })

    formData.set('existingImages', JSON.stringify(existingPayload))
    newFiles.forEach((f) => formData.append('images', f))

    startTransition(async () => {
      const result =
        mode === 'create'
          ? await createListingAction(formData)
          : await updateListingAction(adId!, formData)

      if (!result.ok) {
        alert.error(result.error)
        return
      }

      alert.success(mode === 'create' ? 'Объявление создано' : 'Объявление обновлено')
      router.push('/')
      router.refresh()
    })
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1 className={styles.title}>
        {mode === 'create' ? 'Новое объявление' : 'Редактирование объявления'}
      </h1>

      <Select
        id="categorySlug"
        label="Категория"
        value={categorySlug}
        onChange={(v) => setValue('categorySlug', v, { shouldValidate: true })}
        options={categories.map((c) => ({ value: c.slug, label: c.title }))}
        error={errors.categorySlug?.message}
      />

      <Select
        id="subcategorySlug"
        label="Подкатегория"
        value={subcategorySlug}
        onChange={(v) => setValue('subcategorySlug', v, { shouldValidate: true })}
        options={filteredSubcategories.map((s) => ({ value: s.slug, label: s.title }))}
        disabled={!categorySlug}
        error={errors.subcategorySlug?.message}
      />

      <Select
        id="citySlug"
        label="Город"
        value={citySlug}
        onChange={(v) => setValue('citySlug', v, { shouldValidate: true })}
        options={cities.map((c) => ({ value: c.slug, label: c.title }))}
        error={errors.citySlug?.message}
      />

      <Input
        id="title"
        label="Название"
        {...register('title')}
        error={errors.title?.message}
        maxLength={120}
      />

      <Textarea
        id="description"
        label="Описание"
        rows={6}
        {...register('description')}
        error={errors.description?.message}
        maxLength={5000}
      />

      <Input
        id="price"
        type="number"
        label="Цена, ₽"
        min={0}
        step={1}
        {...register('price')}
        error={errors.price?.message as string | undefined}
      />

      {attributeDef && (
        <AttributesFields
          fields={attributeDef.fields}
          register={(name) => register(name as never)}
          errors={errors as never}
          values={attributesValues}
          setValue={(name, value) =>
            setValue(name as never, value as never, { shouldValidate: true })
          }
          carBrandOptions={carBrandOptions}
          carBrandLoading={carBrandLoading}
          carModelOptions={carModelOptions}
          carModelLoading={carModelLoading}
          onBrandChange={handleBrandChange}
        />
      )}

      <ImageUploader items={images} onChange={setImages} />

      <Button type="submit" loading={pending} full>
        {mode === 'create' ? 'Разместить объявление' : 'Сохранить изменения'}
      </Button>
    </form>
  )
}
