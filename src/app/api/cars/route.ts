import { NextResponse } from 'next/server'
import carsData from '@/data/cars.json'

type RawModel = {
  id: string
  mark_id: string
  name: string
  cyrillic_name?: string
}

type RawBrand = {
  id: string
  name: string
  cyrillic_name?: string
  models: RawModel[]
}

const data = (carsData as { data: RawBrand[] }).data

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const brandId = searchParams.get('brand')

  if (brandId) {
    const brand = data.find((b) => b.id === brandId)
    if (!brand) {
      return NextResponse.json(
        { models: [] },
        { headers: { 'Cache-Control': 'public, max-age=86400' } },
      )
    }
    const models = brand.models.map((m) => ({ id: m.id, name: m.name }))
    return NextResponse.json({ models }, { headers: { 'Cache-Control': 'public, max-age=86400' } })
  }

  const brands = data.map((b) => ({ id: b.id, name: b.name }))
  return NextResponse.json({ brands }, { headers: { 'Cache-Control': 'public, max-age=86400' } })
}
