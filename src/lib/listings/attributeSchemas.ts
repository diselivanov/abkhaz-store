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

const roomsOptions: SelectOption[] = [
  { value: 'studio', label: 'Студия' },
  { value: 'free', label: 'Свободная планировка' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
  { value: '5', label: '5' },
  { value: '6', label: '6+' },
]

const intField = () => z.number().int().optional()
const numberField = () => z.number().optional()
const selectField = (options: readonly [string, ...string[]]) => z.enum(options).optional()

export const attributeDefs: Record<string, Record<string, AttributeDef>> = {
  nedvizhimost: {
    kvartiry: {
      schema: z.object({
        rooms: selectField(['studio', 'free', '1', '2', '3', '4', '5', '6']),
        area: numberField(),
        floor: intField(),
        totalFloors: intField(),
      }),
      fields: {
        rooms: { type: 'select', label: 'Количество комнат', options: roomsOptions },
        area: { type: 'number', label: 'Общая площадь, м²' },
        floor: { type: 'int', label: 'Этаж' },
        totalFloors: { type: 'int', label: 'Этажность дома' },
      },
    },
    'doma-dachi-kottedzhi': {
      schema: z.object({
        houseArea: numberField(),
        landArea: numberField(),
        rooms: selectField(['studio', 'free', '1', '2', '3', '4', '5', '6']),
        floors: intField(),
      }),
      fields: {
        houseArea: { type: 'number', label: 'Площадь дома, м²' },
        landArea: { type: 'number', label: 'Площадь участка, соток' },
        rooms: { type: 'select', label: 'Количество комнат', options: roomsOptions },
        floors: { type: 'int', label: 'Этажей' },
      },
    },
    'kommercheskaya-nedvizhimost': {
      schema: z.object({
        area: numberField(),
      }),
      fields: {
        area: { type: 'number', label: 'Площадь, м²' },
      },
    },
    'zemelnye-uchastki': {
      schema: z.object({
        area: numberField(),
      }),
      fields: {
        area: { type: 'number', label: 'Площадь, соток' },
      },
    },
  },
  'arenda-zhilya': {
    'arenda-kvartiry': {
      schema: z.object({
        rooms: selectField(['studio', 'free', '1', '2', '3', '4', '5', '6']),
        area: numberField(),
        floor: intField(),
        totalFloors: intField(),
        rentTerm: selectField(['daily', 'long']),
      }),
      fields: {
        rentTerm: { type: 'select', label: 'Срок аренды', options: rentTermOptions },
        rooms: { type: 'select', label: 'Количество комнат', options: roomsOptions },
        area: { type: 'number', label: 'Общая площадь, м²' },
        floor: { type: 'int', label: 'Этаж' },
        totalFloors: { type: 'int', label: 'Этажность дома' },
      },
    },
    'arenda-komnaty': {
      schema: z.object({
        area: numberField(),
        rentTerm: selectField(['daily', 'long']),
      }),
      fields: {
        rentTerm: { type: 'select', label: 'Срок аренды', options: rentTermOptions },
        area: { type: 'number', label: 'Площадь комнаты, м²' },
      },
    },
    'arenda-doma-dachi-kottedzhi': {
      schema: z.object({
        houseArea: numberField(),
        landArea: numberField(),
        rooms: selectField(['studio', 'free', '1', '2', '3', '4', '5', '6']),
        rentTerm: selectField(['daily', 'long']),
      }),
      fields: {
        rentTerm: { type: 'select', label: 'Срок аренды', options: rentTermOptions },
        houseArea: { type: 'number', label: 'Площадь дома, м²' },
        landArea: { type: 'number', label: 'Площадь участка, соток' },
        rooms: { type: 'select', label: 'Количество комнат', options: roomsOptions },
      },
    },
  },
  transport: {
    'legkovye-avtomobili': {
      schema: z.object({
        brand: z.string().optional(),
        model: z.string().optional(),
        year: intField(),
        mileage: intField(),
        transmission: selectField(['automatic', 'manual', 'cvt', 'robot']),
        fuel: selectField(['petrol', 'diesel', 'gas', 'hybrid', 'electric']),
        customsCleared: selectField(['yes', 'no']),
        exchange: selectField(['yes', 'no']),
      }),
      fields: {
        brand: { type: 'carBrand', label: 'Марка' },
        model: { type: 'carModel', label: 'Модель' },
        year: { type: 'int', label: 'Год выпуска' },
        mileage: { type: 'int', label: 'Пробег, км' },
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
