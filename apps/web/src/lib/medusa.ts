import type { Category, Product } from './strapi';

/**
 * Product data comes from Medusa (the store API), not Strapi. This file reads it and shapes it into the same `Product`
 * the pages and cards already use, so the rest of the site did not have to change.
 *
 * Where each field lives in Medusa:
 *   title, handle, subtitle (short description), description (long description), images, tags (keywords), categories,
 *   the single variant (SKU, price in INR, stock), and metadata for the rest: specifications, features, details, mrp,
 *   gst_rate, min_order_qty, certifications, datasheet_url, badge, featured, rating, review_count, unit.
 */
const BASE = process.env.MEDUSA_URL ?? 'http://localhost:9000';
const KEY = process.env.MEDUSA_PUBLISHABLE_KEY ?? '';

/* eslint-disable @typescript-eslint/no-explicit-any */
type MedusaProduct = any;

async function store<T = any>(path: string, query: Record<string, string | string[]> = {}): Promise<T> {
  const url = new URL(`/store/${path}`, BASE);
  for (const [key, value] of Object.entries(query)) for (const item of Array.isArray(value) ? value : [value]) url.searchParams.append(key, item);
  const res = await fetch(url, { headers: { 'x-publishable-api-key': KEY }, next: { revalidate: 60 } });
  if (!res.ok) throw new Error(`Medusa ${res.status} for ${url.pathname}`);
  return (await res.json()) as T;
}

/** The India region id (prices are calculated per region). */
async function regionId(): Promise<string> {
  const { regions } = await store<{ regions: { id: string; currency_code: string }[] }>('regions');
  return (regions.find((region) => region.currency_code === 'inr') ?? regions[0]).id;
}

type Cat = { id: string; name: string; handle: string; parent: string | null; rank: number };

/** All product categories, so each product can show its category and the parent above it. */
async function categoryMap(): Promise<Map<string, Cat>> {
  const { product_categories } = await store<{ product_categories: any[] }>('product-categories', {
    limit: '200',
    fields: 'id,name,handle,parent_category_id,rank',
  });
  return new Map(product_categories.map((c) => [c.id, { id: c.id, name: c.name, handle: c.handle, parent: c.parent_category_id ?? null, rank: c.rank ?? 0 }]));
}

const asCategory = (cat: Cat | undefined, all: Map<string, Cat>): Category | null =>
  cat
    ? {
        documentId: cat.id,
        name: cat.name,
        slug: cat.handle,
        order: cat.rank,
        parent: cat.parent && all.get(cat.parent) ? asCategory(all.get(cat.parent), all) : null,
      }
    : null;

const FIELDS = '+metadata,+variants.inventory_quantity,*variants.calculated_price,*categories,*images,*tags';

function toProduct(p: MedusaProduct, all: Map<string, Cat>): Product {
  const meta = p.metadata ?? {};
  const variant = p.variants?.[0];
  const price = variant?.calculated_price?.calculated_amount;
  return {
    documentId: p.id,
    name: p.title,
    slug: p.handle,
    shortDescription: p.subtitle ?? null,
    description: p.description ?? null,
    brief: null,
    featured: Boolean(meta.featured),
    sku: variant?.sku ?? null,
    variantId: variant?.id ?? null,
    badge: meta.badge || null,
    price: typeof price === 'number' ? price : null,
    compareAtPrice: typeof meta.mrp === 'number' ? meta.mrp : null,
    rating: typeof meta.rating === 'number' ? meta.rating : null,
    reviewCount: typeof meta.review_count === 'number' ? meta.review_count : null,
    createdAt: p.created_at,
    stock: typeof variant?.inventory_quantity === 'number' ? variant.inventory_quantity : null,
    unit: meta.unit || null,
    features: ((meta.features ?? []) as { title: string; description?: string }[]).map((f, id) => ({ id, title: f.title, description: f.description || null })),
    specifications: ((meta.specifications ?? []) as { label: string; value: string }[]).map((s, id) => ({ id, ...s })),
    details: ((meta.details ?? []) as { label: string; value?: string; asList?: boolean }[]).map((d, id) => ({ id, ...d })),
    images: ((p.images ?? []) as { url: string }[]).map((image) => ({ url: image.url, alternativeText: p.title })),
    category: asCategory(all.get(p.categories?.[0]?.id), all),
  };
}

/** Every product (published, in the store's sales channel), A to Z. */
export async function getAllProducts(): Promise<Product[]> {
  const [region, all] = await Promise.all([regionId(), categoryMap()]);
  const items: MedusaProduct[] = [];
  for (let offset = 0; ; offset += 100) {
    const page = await store<{ products: MedusaProduct[]; count: number }>('products', { region_id: region, fields: FIELDS, limit: '100', offset: String(offset) });
    items.push(...page.products);
    if (items.length >= page.count || page.products.length === 0) break;
  }
  return items.map((item) => toProduct(item, all)).sort((a, b) => a.name.localeCompare(b.name));
}

export async function getProduct(slug: string): Promise<Product | null> {
  const [region, all] = await Promise.all([regionId(), categoryMap()]);
  const { products } = await store<{ products: MedusaProduct[] }>('products', { handle: slug, region_id: region, fields: FIELDS, limit: '1' });
  return products[0] ? toProduct(products[0], all) : null;
}

/** Products in a category, including its sub-categories. */
export async function getProductsInCategory(categorySlug: string): Promise<Product[]> {
  const [region, all] = await Promise.all([regionId(), categoryMap()]);
  const category = [...all.values()].find((cat) => cat.handle === categorySlug);
  if (!category) return [];
  // Medusa matches a product only to the category it is filed under, so ask for the category and everything below it.
  const ids = [category.id];
  for (const id of ids) for (const cat of all.values()) if (cat.parent === id && !ids.includes(cat.id)) ids.push(cat.id);
  const { products } = await store<{ products: MedusaProduct[] }>('products', { region_id: region, fields: FIELDS, category_id: ids, limit: '100' });
  return products.map((item) => toProduct(item, all)).sort((a, b) => a.name.localeCompare(b.name));
}

/** Up to four other products from the same category. */
export async function getRelatedProducts(categorySlug: string, excludeSlug: string): Promise<Product[]> {
  const same = await getProductsInCategory(categorySlug);
  return same.filter((product) => product.slug !== excludeSlug).slice(0, 4);
}
