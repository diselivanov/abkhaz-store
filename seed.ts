import 'dotenv/config'
import { getPayload } from 'payload'
import config from './src/payload.config'

type CitySeed = { title: string; slug: string; order: number }
type SubSeed = { title: string; slug: string; order: number }
type CatSeed = { title: string; slug: string; order: number; subs: SubSeed[] }

const cities: CitySeed[] = [
  { title: 'Сухум', slug: 'sukhum', order: 1 },
  { title: 'Гагра', slug: 'gagra', order: 2 },
  { title: 'Новый Афон', slug: 'novy-afon', order: 3 },
  { title: 'Гудаута', slug: 'gudauta', order: 4 },
  { title: 'Гал', slug: 'gal', order: 5 },
  { title: 'Пицунда', slug: 'pitsunda', order: 6 },
  { title: 'Ткуарчал', slug: 'tkuarchal', order: 7 },
  { title: 'Очамчыра', slug: 'ochamchyra', order: 8 },
]

const categories: CatSeed[] = [
  {
    title: 'Недвижимость',
    slug: 'nedvizhimost',
    order: 1,
    subs: [
      { title: 'Квартиры', slug: 'kvartiry', order: 1 },
      { title: 'Дома, дачи, коттеджи', slug: 'doma-dachi-kottedzhi', order: 2 },
      { title: 'Коммерческая недвижимость', slug: 'kommercheskaya-nedvizhimost', order: 3 },
      { title: 'Земельные участки', slug: 'zemelnye-uchastki', order: 4 },
    ],
  },
  {
    title: 'Аренда жилья',
    slug: 'arenda-zhilya',
    order: 2,
    subs: [
      { title: 'Квартиры', slug: 'arenda-kvartiry', order: 1 },
      { title: 'Комнаты', slug: 'arenda-komnaty', order: 2 },
      { title: 'Дома, дачи, коттеджи', slug: 'arenda-doma-dachi-kottedzhi', order: 3 },
    ],
  },
  {
    title: 'Транспорт',
    slug: 'transport',
    order: 3,
    subs: [
      { title: 'Легковые автомобили', slug: 'legkovye-avtomobili', order: 1 },
      { title: 'Грузовики и спецтехника', slug: 'gruzoviki-i-spectehnika', order: 2 },
      { title: 'Мотоциклы и мототехника', slug: 'motocikly-i-mototehnika', order: 3 },
      { title: 'Водный транспорт', slug: 'vodnyj-transport', order: 4 },
    ],
  },
  {
    title: 'Запчасти и аксессуары',
    slug: 'zapchasti-i-aksessuary',
    order: 4,
    subs: [
      { title: 'Запчасти', slug: 'zapchasti', order: 1 },
      { title: 'Шины, диски и колёса', slug: 'shiny-diski-i-kolesa', order: 2 },
      { title: 'Аудио- и видеотехника', slug: 'audio-i-videotehnika', order: 3 },
      { title: 'Аксессуары', slug: 'aksessuary', order: 4 },
      { title: 'Багажники и фаркопы', slug: 'bagazhniki-i-farkopy', order: 5 },
      { title: 'Инструменты', slug: 'instrumenty', order: 6 },
      { title: 'Прицепы', slug: 'pricepy', order: 7 },
      { title: 'Экипировка', slug: 'ekipirovka', order: 8 },
      { title: 'Масла и автохимия', slug: 'masla-i-avtohimiya', order: 9 },
    ],
  },
  {
    title: 'Электроника',
    slug: 'elektronika',
    order: 5,
    subs: [
      { title: 'Мобильные телефоны', slug: 'mobilnye-telefony', order: 1 },
      { title: 'Планшеты', slug: 'planshety', order: 2 },
      { title: 'Компьютеры', slug: 'kompyutery', order: 3 },
      { title: 'Ноутбуки', slug: 'noutbuki', order: 4 },
      { title: 'Фототехника', slug: 'fototehnika', order: 5 },
      { title: 'Аудио и видео', slug: 'audio-i-video', order: 6 },
      { title: 'Товары для компьютера', slug: 'tovary-dlya-kompyutera', order: 7 },
      { title: 'Оргтехника и расходники', slug: 'orgtehnika-i-rashodniki', order: 8 },
    ],
  },
  {
    title: 'Работа',
    slug: 'rabota',
    order: 6,
    subs: [
      { title: 'Вакансии', slug: 'vakansii', order: 1 },
      { title: 'Резюме', slug: 'rezyume', order: 2 },
    ],
  },
  {
    title: 'Услуги',
    slug: 'uslugi',
    order: 7,
    subs: [
      { title: 'Автосервис', slug: 'avtoservis', order: 1 },
      { title: 'Обучение, курсы', slug: 'obuchenie-kursy', order: 2 },
      { title: 'Перевозки и доставка', slug: 'perevozki-i-dostavka', order: 3 },
      { title: 'Пассажирские перевозки', slug: 'passazhirskie-perevozki', order: 4 },
      { title: 'Деловые услуги', slug: 'delovye-uslugi', order: 5 },
      { title: 'Грузчики, складские услуги', slug: 'gruzchiki-skladskie-uslugi', order: 6 },
      { title: 'Ремонт и отделка', slug: 'remont-i-otdelka', order: 7 },
      { title: 'Уборка', slug: 'uborka', order: 8 },
      { title: 'Строительство', slug: 'stroitelstvo', order: 9 },
      { title: 'Сад, благоустройство', slug: 'sad-blagoustrojstvo', order: 10 },
      { title: 'Красота и здоровье', slug: 'krasota-i-zdorove', order: 11 },
      { title: 'Праздники, мероприятия', slug: 'prazdniki-meropriyatiya', order: 12 },
      { title: 'Ремонт и обслуживание техники', slug: 'remont-i-obsluzhivanie-tehniki', order: 13 },
      { title: 'Компьютерная помощь', slug: 'kompyuternaya-pomosch', order: 14 },
    ],
  },
  {
    title: 'Животные',
    slug: 'zhivotnye',
    order: 8,
    subs: [
      { title: 'Собаки', slug: 'sobaki', order: 1 },
      { title: 'Кошки', slug: 'koshki', order: 2 },
      { title: 'Птицы', slug: 'pticy', order: 3 },
      { title: 'Аквариум', slug: 'akvarium', order: 4 },
      { title: 'Сельскохозяйственные', slug: 'selskohozyajstvennye', order: 5 },
      { title: 'Товары для животных', slug: 'tovary-dlya-zhivotnyh', order: 6 },
    ],
  },
  {
    title: 'Для дома и дачи',
    slug: 'dlya-doma-i-dachi',
    order: 9,
    subs: [
      { title: 'Ремонт и строительство', slug: 'dom-remont-i-stroitelstvo', order: 1 },
      { title: 'Продукты питания', slug: 'produkty-pitaniya', order: 2 },
      { title: 'Мебель и интерьер', slug: 'mebel-i-interer', order: 3 },
      { title: 'Растения', slug: 'rasteniya', order: 4 },
      { title: 'Бытовая техника', slug: 'bytovaya-tehnika', order: 5 },
      { title: 'Посуда и товары для кухни', slug: 'posuda-i-tovary-dlya-kuhni', order: 6 },
    ],
  },
  {
    title: 'Личные вещи',
    slug: 'lichnye-veschi',
    order: 10,
    subs: [
      { title: 'Женская одежда', slug: 'zhenskaya-odezhda', order: 1 },
      { title: 'Женская обувь', slug: 'zhenskaya-obuv', order: 2 },
      { title: 'Мужская одежда', slug: 'muzhskaya-odezhda', order: 3 },
      { title: 'Мужская обувь', slug: 'muzhskaya-obuv', order: 4 },
      { title: 'Аксессуары', slug: 'lichnye-aksessuary', order: 5 },
      { title: 'Красота и здоровье', slug: 'lichnye-krasota-i-zdorove', order: 6 },
      { title: 'Товары для детей', slug: 'tovary-dlya-detej', order: 7 },
    ],
  },
  {
    title: 'Хобби и отдых',
    slug: 'hobbi-i-otdyh',
    order: 11,
    subs: [
      { title: 'Музыкальные инструменты', slug: 'muzykalnye-instrumenty', order: 1 },
      { title: 'Велосипеды', slug: 'velosipedy', order: 2 },
      { title: 'Охота и рыбалка', slug: 'ohota-i-rybalka', order: 3 },
      { title: 'Спорт и отдых', slug: 'sport-i-otdyh', order: 4 },
      { title: 'Книги и журналы', slug: 'knigi-i-zhurnaly', order: 5 },
      { title: 'Коллекционирование', slug: 'kollekcionirovanie', order: 6 },
    ],
  },
  {
    title: 'Бизнес и оборудование',
    slug: 'biznes-i-oborudovanie',
    order: 12,
    subs: [
      { title: 'Оборудование для бизнеса', slug: 'oborudovanie-dlya-biznesa', order: 1 },
      { title: 'Готовый бизнес', slug: 'gotovyj-biznes', order: 2 },
    ],
  },
]

async function upsertBySlug(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: 'listingCities' | 'listingCategories',
  doc: { title: string; slug: string; order: number },
) {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: doc.slug } },
    limit: 1,
    depth: 0,
  })
  if (existing.docs.length > 0) {
    await payload.update({ collection, id: existing.docs[0].id, data: doc })
    return existing.docs[0].id
  }
  const created = await payload.create({ collection, data: doc })
  return created.id
}

async function main() {
  const payload = await getPayload({ config })

  for (const city of cities) {
    await upsertBySlug(payload, 'listingCities', city)
  }
  console.log(`Cities: ${cities.length}`)

  let subsCount = 0
  for (const cat of categories) {
    const catId = await upsertBySlug(payload, 'listingCategories', {
      title: cat.title,
      slug: cat.slug,
      order: cat.order,
    })

    for (const sub of cat.subs) {
      const existing = await payload.find({
        collection: 'listingSubcategories',
        where: { slug: { equals: sub.slug } },
        limit: 1,
        depth: 0,
      })
      const data = {
        title: sub.title,
        slug: sub.slug,
        order: sub.order,
        category: catId,
      }
      if (existing.docs.length > 0) {
        await payload.update({
          collection: 'listingSubcategories',
          id: existing.docs[0].id,
          data,
        })
      } else {
        await payload.create({ collection: 'listingSubcategories', data })
      }
      subsCount += 1
    }
  }
  console.log(`Categories: ${categories.length}, subcategories: ${subsCount}`)

  console.log('Seed completed')
  process.exit(0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
