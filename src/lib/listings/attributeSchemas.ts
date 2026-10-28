import { z } from 'zod'

export type SelectOption = { value: string; label: string }

export type FieldMeta =
  | { type: 'int'; label: string; min?: number; max?: number }
  | { type: 'number'; label: string; min?: number; max?: number }
  | { type: 'text'; label: string; maxLength?: number }
  | { type: 'select'; label: string; options: SelectOption[] }
  | { type: 'carBrand'; label: string }
  | { type: 'carModel'; label: string }

export type AttributeDef = {
  schema: z.ZodObject<z.ZodRawShape>
  fields: Record<string, FieldMeta>
}

const currentYear = () => new Date().getFullYear()

const transmissionOptions: SelectOption[] = [
  { value: 'automatic', label: 'Автомат' },
  { value: 'manual', label: 'Механика' },
  { value: 'cvt', label: 'Вариатор' },
  { value: 'robot', label: 'Робот' },
]

const fuelOptions: SelectOption[] = [
  { value: 'petrol', label: 'Бензин' },
  { value: 'diesel', label: 'Дизель' },
  { value: 'gas', label: 'Газ' },
  { value: 'hybrid', label: 'Гибрид' },
  { value: 'electric', label: 'Электро' },
]

const yesNoOptions: SelectOption[] = [
  { value: 'yes', label: 'Да' },
  { value: 'no', label: 'Нет' },
]

const rentTermOptions: SelectOption[] = [
  { value: 'daily', label: 'Посуточно' },
  { value: 'long', label: 'Долгосрочно' },
]

const intField = () => z.number({ message: 'Введите число' }).int('Введите целое число').optional()
const numberField = () => z.number({ message: 'Введите число' }).optional()

export const attributeDefs: Record<string, Record<string, AttributeDef>> = {
  nedvizhimost: {
    kvartiry: {
      schema: z.object({
        rooms: intField(),
        area: numberField(),
        floor: intField(),
        totalFloors: intField(),
      }),
      fields: {
        rooms: { type: 'int', label: 'Количество комнат', min: 0 },
        area: { type: 'number', label: 'Общая площадь, м²', min: 0 },
        floor: { type: 'int', label: 'Этаж', min: 1 },
        totalFloors: { type: 'int', label: 'Этажность дома', min: 1 },
      },
    },
    'doma-dachi-kottedzhi': {
      schema: z.object({
        houseArea: numberField(),
        landArea: numberField(),
        rooms: intField(),
        floors: intField(),
      }),
      fields: {
        houseArea: { type: 'number', label: 'Площадь дома, м²', min: 0 },
        landArea: { type: 'number', label: 'Площадь участка, соток', min: 0 },
        rooms: { type: 'int', label: 'Количество комнат', min: 0 },
        floors: { type: 'int', label: 'Этажей', min: 1 },
      },
    },
    'kommercheskaya-nedvizhimost': {
      schema: z.object({
        area: numberField(),
      }),
      fields: {
        area: { type: 'number', label: 'Площадь, м²', min: 0 },
      },
    },
    'zemelnye-uchastki': {
      schema: z.object({
        area: numberField(),
      }),
      fields: {
        area: { type: 'number', label: 'Площадь, соток', min: 0 },
      },
    },
  },
  'arenda-zhilya': {
    'arenda-kvartiry': {
      schema: z.object({
        rooms: intField(),
        area: numberField(),
        floor: intField(),
        totalFloors: intField(),
        rentTerm: z.enum(['daily', 'long']).optional(),
      }),
      fields: {
        rentTerm: { type: 'select', label: 'Срок аренды', options: rentTermOptions },
        rooms: { type: 'int', label: 'Количество комнат', min: 0 },
        area: { type: 'number', label: 'Общая площадь, м²', min: 0 },
        floor: { type: 'int', label: 'Этаж', min: 1 },
        totalFloors: { type: 'int', label: 'Этажность дома', min: 1 },
      },
    },
    'arenda-komnaty': {
      schema: z.object({
        area: numberField(),
        rentTerm: z.enum(['daily', 'long']).optional(),
      }),
      fields: {
        rentTerm: { type: 'select', label: 'Срок аренды', options: rentTermOptions },
        area: { type: 'number', label: 'Площадь комнаты, м²', min: 0 },
      },
    },
    'arenda-doma-dachi-kottedzhi': {
      schema: z.object({
        houseArea: numberField(),
        landArea: numberField(),
        rooms: intField(),
        rentTerm: z.enum(['daily', 'long']).optional(),
      }),
      fields: {
        rentTerm: { type: 'select', label: 'Срок аренды', options: rentTermOptions },
        houseArea: { type: 'number', label: 'Площадь дома, м²', min: 0 },
        landArea: { type: 'number', label: 'Площадь участка, соток', min: 0 },
        rooms: { type: 'int', label: 'Количество комнат', min: 0 },
      },
    },
  },
  transport: {
    'legkovye-avtomobili': {
      schema: z.object({
        brand: z.string().optional(),
        model: z.string().optional(),
        year: z.number().int().min(1900).max(currentYear()).optional(),
        mileage: intField(),
        transmission: z.enum(['automatic', 'manual', 'cvt', 'robot']).optional(),
        fuel: z.enum(['petrol', 'diesel', 'gas', 'hybrid', 'electric']).optional(),
        customsCleared: z.enum(['yes', 'no']).optional(),
        exchange: z.enum(['yes', 'no']).optional(),
      }),
      fields: {
        brand: { type: 'carBrand', label: 'Марка' },
        model: { type: 'carModel', label: 'Модель' },
        year: { type: 'int', label: 'Год выпуска', min: 1900, max: currentYear() },
        mileage: { type: 'int', label: 'Пробег, км', min: 0 },
        transmission: { type: 'select', label: 'Коробка передач', options: transmissionOptions },
        fuel: { type: 'select', label: 'Тип топлива', options: fuelOptions },
        customsCleared: { type: 'select', label: 'Растаможен', options: yesNoOptions },
        exchange: { type: 'select', label: 'Обмен', options: yesNoOptions },
      },
    },
  },
}

export function getAttributeDef(
  categorySlug: string,
  subcategorySlug: string,
): AttributeDef | null {
  return attributeDefs[categorySlug]?.[subcategorySlug] ?? null
}
