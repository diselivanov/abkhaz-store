export function formatPrice(price: number): string {
  return `${price.toLocaleString('ru-RU')} ₽`
}

export function getListingUrl(listing: {
  slug: string
  city: { slug: string } | number
  category: { slug: string } | number
  subcategory: { slug: string } | number
}): string {
  const city = typeof listing.city === 'object' ? listing.city.slug : ''
  const category = typeof listing.category === 'object' ? listing.category.slug : ''
  const subcategory = typeof listing.subcategory === 'object' ? listing.subcategory.slug : ''
  return `/${city}/${category}/${subcategory}/${listing.slug}`
}
