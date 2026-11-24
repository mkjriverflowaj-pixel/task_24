import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, ProductStatus } from '@medusajs/framework/utils'
import {
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductTagsWorkflow,
  createProductsWorkflow,
  deleteProductsWorkflow,
  updateProductsWorkflow,
  uploadFilesWorkflow,
} from '@medusajs/medusa/core-flows'

/**
 * Moves the product catalogue from Strapi into Medusa, so Medusa is the one place for product data.
 *
 *   npm run import:products            adds what is missing (safe to run again)
 *   npm run import:products -- force          deletes and recreates products that already exist
 *   npm run import:products -- sync-details   refreshes specs, features and every details row of existing products
 *
 * Medusa field map:
 *   name -> title                  slug -> handle              short description -> subtitle
 *   long description -> description (the brief when Strapi only holds placeholder text)
 *   category / sub-category -> product categories (same slugs as Strapi)
 *   keywords -> tags               images -> uploaded to Medusa's file storage
 *   SKU, price, stock -> the single variant (price in INR), inventory level at Safonix Warehouse
 *   specifications, features, details, MRP, GST rate, minimum order quantity, certifications,
 *   datasheet link, badge, rating, unit -> product metadata
 */
const STRAPI = process.env.STRAPI_URL ?? 'http://localhost:1337'
let FORCE = process.env.FORCE === '1'
let SYNC_DETAILS = process.env.SYNC_DETAILS === '1'
const GST_RATE = 18

/* eslint-disable @typescript-eslint/no-explicit-any */
type Strapi = Record<string, any>

async function strapiAll(path: string, populate: string[]): Promise<Strapi[]> {
  const rows: Strapi[] = []
  for (let page = 1; ; page++) {
    const url = new URL(`/api/${path}`, STRAPI)
    populate.forEach((value, index) => url.searchParams.set(`populate[${index}]`, value))
    url.searchParams.set('pagination[pageSize]', '100')
    url.searchParams.set('pagination[page]', String(page))
    url.searchParams.set('sort', 'id')
    const res = await fetch(url)
    if (!res.ok) throw new Error(`Strapi ${res.status} for ${url.pathname}. Is Strapi running at ${STRAPI}?`)
    const body = (await res.json()) as { data: Strapi[]; meta: { pagination: { pageCount: number } } }
    rows.push(...body.data)
    if (page >= body.meta.pagination.pageCount) return rows
  }
}

/**
 * Everything Strapi holds about a product that is not a native Medusa field. The "details" rows are copied as they are
 * (Product Code, Product Range, Technical Specifications, Product Features, Country of Origin, Brochure / Data, Warranty,
 * Best Suited For, Name & Address of Manufacturer, ...), so nothing is lost; the website decides what to show.
 */
function metadataFor(p: Strapi) {
  const rows = (p.details ?? []) as Strapi[]
  const datasheet = rows.find((row) => /brochure|datasheet/i.test(row.label) && /^https?:\/\//i.test(row.value ?? ''))
  return {
    mrp: p.compareAtPrice ?? null,
    gst_rate: GST_RATE,
    min_order_qty: 1,
    certifications: [] as string[],
    datasheet_url: datasheet?.value ?? '',
    badge: p.badge ?? '',
    featured: Boolean(p.featured),
    rating: p.rating ?? null,
    review_count: p.reviewCount ?? 0,
    unit: p.unit ?? '',
    brief: p.brief ?? '',
    specifications: ((p.specifications ?? []) as Strapi[]).map((s) => ({ label: s.label, value: s.value })),
    features: ((p.features ?? []) as Strapi[]).map((f) => ({ title: f.title, description: f.description ?? '' })),
    details: rows.map((row) => ({ label: row.label, value: row.value ?? '', asList: Boolean(row.asList) })),
  }
}

const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2)

export default async function importStrapiProducts({ container, args }: ExecArgs) {
  FORCE = FORCE || (args ?? []).includes('force')
  SYNC_DETAILS = SYNC_DETAILS || (args ?? []).includes('sync-details')
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)

  // Things the products attach to (created by `npm run seed`).
  const { data: channels } = await query.graph({ entity: 'sales_channel', fields: ['id'], filters: { name: 'Safonix Web Store' } })
  const { data: locations } = await query.graph({ entity: 'stock_location', fields: ['id'], filters: { name: 'Safonix Warehouse' } })
  const { data: profiles } = await query.graph({ entity: 'shipping_profile', fields: ['id'] })
  if (!channels.length || !locations.length || !profiles.length) throw new Error('Run "npm run seed" first (sales channel, warehouse and shipping profile are missing).')

  // 1. Categories: top level first, then children, same slugs as Strapi.
  const strapiCategories = await strapiAll('categories', ['parent'])
  const { data: existingCategories } = await query.graph({ entity: 'product_category', fields: ['id', 'handle'] })
  const categoryId = new Map<string, string>(existingCategories.map((c: any) => [c.handle, c.id]))
  const bySlug = new Map(strapiCategories.map((c) => [c.slug as string, c]))
  const depth = (c: Strapi): number => (c.parent ? 1 + depth(bySlug.get(c.parent.slug) ?? { parent: null }) : 0)
  const ordered = [...strapiCategories].sort((a, b) => depth(a) - depth(b) || (a.order ?? 0) - (b.order ?? 0))
  let createdCategories = 0
  for (const category of ordered) {
    if (categoryId.has(category.slug)) continue
    const { result } = await createProductCategoriesWorkflow(container).run({
      input: {
        product_categories: [
          {
            name: category.name,
            handle: category.slug,
            description: category.tagline ?? undefined,
            is_active: true,
            parent_category_id: category.parent ? categoryId.get(category.parent.slug) : undefined,
            rank: category.order ?? 0,
          },
        ],
      },
    })
    categoryId.set(category.slug, result[0].id)
    createdCategories++
  }
  logger.info(`Categories: ${createdCategories} created, ${categoryId.size} in total.`)

  // 2. Products.
  const strapiProducts = await strapiAll('products', ['images', 'category', 'category.parent', 'features', 'specifications', 'details'])
  logger.info(`Strapi has ${strapiProducts.length} products.`)

  const { data: existing } = await query.graph({ entity: 'product', fields: ['id', 'handle'] })
  const existingByHandle = new Map<string, string>(existing.map((p: any) => [p.handle, p.id]))
  if (FORCE) {
    const ids = strapiProducts.map((p) => existingByHandle.get(p.slug)).filter(Boolean) as string[]
    if (ids.length) {
      await deleteProductsWorkflow(container).run({ input: { ids } })
      logger.info(`FORCE: deleted ${ids.length} existing products.`)
    }
    existingByHandle.clear()
  }

  // Images are copied into Medusa's own file storage once each, so the store no longer depends on Strapi's uploads.
  const uploaded = new Map<string, string>()
  async function copyImage(src: string): Promise<string | null> {
    if (uploaded.has(src)) return uploaded.get(src)!
    try {
      const res = await fetch(src.startsWith('http') ? src : new URL(src, STRAPI))
      if (!res.ok) return null
      const buffer = Buffer.from(await res.arrayBuffer())
      const filename = decodeURIComponent(src.split('/').pop() ?? 'image.png')
      const mimeType = res.headers.get('content-type') ?? 'image/png'
      const { result } = await uploadFilesWorkflow(container).run({
        input: { files: [{ filename, mimeType, content: buffer.toString('base64'), access: 'public' }] },
      })
      uploaded.set(src, result[0].url)
      return result[0].url
    } catch {
      return null
    }
  }

  // Keywords become Medusa product tags (created once, reused by every product that has them).
  const { data: existingTags } = await query.graph({ entity: 'product_tag', fields: ['id', 'value'] })
  const tagId = new Map<string, string>(existingTags.map((t: any) => [t.value, t.id]))
  async function tagIds(values: string[]) {
    const missing = values.filter((value) => !tagId.has(value))
    if (missing.length) {
      const { result } = await createProductTagsWorkflow(container).run({ input: { product_tags: missing.map((value) => ({ value })) } })
      result.forEach((tag: any) => tagId.set(tag.value, tag.id))
    }
    return values.map((value) => tagId.get(value)!).filter(Boolean)
  }

  const usedSkus = new Set<string>()
  let created = 0
  let skipped = 0
  let synced = 0
  const stock = new Map<string, number>() // sku -> stocked quantity

  for (const p of strapiProducts) {
    if (existingByHandle.has(p.slug)) {
      // SYNC_DETAILS=1 refreshes the stored details of products that already exist (no images or prices are touched).
      if (SYNC_DETAILS) {
        await updateProductsWorkflow(container).run({ input: { selector: { id: existingByHandle.get(p.slug)! }, update: { metadata: metadataFor(p) } } })
        synced++
      } else skipped++
      continue
    }
    const cat = p.category as Strapi | null
    const leaf = cat ? categoryId.get(cat.slug) : undefined

    const placeholder = /replace this text|sample description/i.test(p.description ?? '')
    const description = ((placeholder ? p.brief : p.description) || p.brief || p.description || '').trim()

    let sku = String(p.sku ?? p.slug).replace(/-{2,}/g, '-')
    while (usedSkus.has(sku)) sku += '-2'
    usedSkus.add(sku)

    const images: { url: string }[] = []
    for (const image of (p.images ?? []) as Strapi[]) {
      const url = await copyImage(image.url)
      if (url) images.push({ url })
    }

    const keywords = [...new Set([cat?.name, cat?.parent?.name, 'safonix', ...words(p.name)].filter(Boolean).map((k) => String(k).toLowerCase()))].slice(0, 14)
    if (p.stock != null) stock.set(sku, Number(p.stock))

    try {
      await createProductsWorkflow(container).run({
        input: {
          products: [
            {
              title: p.name,
              handle: p.slug,
              subtitle: p.shortDescription ?? undefined,
              description: description || undefined,
              status: ProductStatus.PUBLISHED,
              thumbnail: images[0]?.url,
              images,
              category_ids: leaf ? [leaf] : [],
              tag_ids: await tagIds(keywords),
              sales_channels: [{ id: channels[0].id }],
              shipping_profile_id: profiles[0].id,
              options: [{ title: 'Option', values: ['Standard'] }],
              variants: [
                {
                  title: 'Standard',
                  sku,
                  manage_inventory: true,
                  allow_backorder: false,
                  options: { Option: 'Standard' },
                  prices: [{ amount: Number(p.price ?? 0), currency_code: 'inr' }],
                },
              ],
              metadata: metadataFor(p),
            },
          ],
        },
      })
      created++
      if (created % 10 === 0) logger.info(`  ${created} products created...`)
    } catch (error) {
      logger.error(`Could not create "${p.name}": ${(error as Error).message}`)
    }
  }
  logger.info(`Products: ${created} created, ${synced} details refreshed, ${skipped} already existed.`)

  // 3. Stock: one inventory level per variant at the warehouse.
  const skus = [...stock.keys()]
  if (skus.length) {
    const { data: variants } = await query.graph({
      entity: 'product_variant',
      fields: ['sku', 'inventory_items.inventory_item_id'],
      filters: { sku: skus },
    })
    const { data: levels } = await query.graph({ entity: 'inventory_level', fields: ['inventory_item_id'], filters: { location_id: locations[0].id } })
    const has = new Set(levels.map((l: any) => l.inventory_item_id))
    const toCreate = (variants as any[])
      .map((v) => ({ inventory_item_id: v.inventory_items?.[0]?.inventory_item_id as string | undefined, stocked_quantity: stock.get(v.sku) ?? 0 }))
      .filter((l) => l.inventory_item_id && !has.has(l.inventory_item_id))
      .map((l) => ({ inventory_item_id: l.inventory_item_id!, location_id: locations[0].id, stocked_quantity: l.stocked_quantity }))
    if (toCreate.length) {
      await createInventoryLevelsWorkflow(container).run({ input: { inventory_levels: toCreate } })
    }
    logger.info(`Stock: ${toCreate.length} inventory levels created.`)
  }
  logger.info('Import finished.')
}
