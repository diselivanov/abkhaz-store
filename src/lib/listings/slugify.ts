import { getPayload } from 'payload'
import config from '@/payload.config'

const MAP: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'e',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'j',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'h',
  ц: 'c',
  ч: 'ch',
  ш: 'sh',
  щ: 'sch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

export function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split('')
    .map((c) => MAP[c] ?? c)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 80)
}

export async function generateUniqueSlug(title: string, excludeId?: number): Promise<string> {
  const payload = await getPayload({ config })
  const base = transliterate(title) || 'listing'

  let candidate = base
  let n = 1

  while (true) {
    const { docs } = await payload.find({
      collection: 'listingAds',
      where: { slug: { equals: candidate } },
      limit: 1,
      depth: 0,
    })
    const found = docs[0]
    if (!found || found.id === excludeId) return candidate
    n += 1
    candidate = `${base}-${n}`
  }
}
