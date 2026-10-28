import type { AttributeDef, FieldMeta } from './attributeSchemas'

export type AttributesInput = Record<string, unknown>

function parseField(meta: FieldMeta, raw: string): unknown {
  switch (meta.type) {
    case 'int':
    case 'number':
      return Number(raw)
    case 'text':
    case 'carBrand':
    case 'carModel':
    case 'select':
      return raw
    default:
      return raw
  }
}

export function parseAttributes(formData: FormData, def: AttributeDef | null): AttributesInput {
  if (!def) return {}
  const result: AttributesInput = {}
  for (const [key, meta] of Object.entries(def.fields)) {
    const raw = formData.get(key)
    if (typeof raw === 'string' && raw !== '') {
      result[key] = parseField(meta, raw)
    }
  }
  return result
}
