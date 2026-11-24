import { z } from 'zod'

/**
 * The extra product fields the brief asks for that Medusa has no column for. They live in product metadata:
 *
 *   mrp, gst_rate, min_order_qty, certifications, datasheet_url, specifications, features, details,
 *   badge, featured, rating, review_count, unit, brief
 *
 * (Name, SKU, price, stock, images, categories, keywords (tags), short description (subtitle), long description and
 * status are Medusa's own fields.)
 *
 * Medusa's admin metadata editor saves everything as text, and the website only reads real numbers and booleans, so
 * "18" typed in the admin would be ignored. `normalizeProductMetadata` turns such text into the right type and
 * rejects values that make no sense (a negative MRP, "abc" as a GST rate). Keys it does not know are left alone.
 */

const fromText = (v: unknown) => {
  if (typeof v !== 'string') return v
  try {
    return JSON.parse(v)
  } catch {
    return v
  }
}
const toNumber = (v: unknown) => (typeof v === 'string' && v.trim() !== '' ? Number(v) : v)
const blankToNull = (v: unknown) => (typeof v === 'string' && v.trim() === '' ? null : v)
const toBoolean = (v: unknown) => (v === 'true' ? true : v === 'false' ? false : v)
const toList = (v: unknown) => {
  const parsed = fromText(v)
  if (Array.isArray(parsed)) return parsed
  // "ISI, BIS" typed in the admin
  return typeof parsed === 'string' ? parsed.split(',').map((s) => s.trim()).filter(Boolean) : parsed
}

const labelValue = z.array(z.object({ label: z.string().min(1), value: z.string() }))

export const productFieldsSchema = z
  .object({
    mrp: z.preprocess((v) => blankToNull(toNumber(v)), z.number().positive().nullable()),
    gst_rate: z.preprocess(toNumber, z.number().min(0).max(100)),
    min_order_qty: z.preprocess(toNumber, z.number().int().min(1)),
    certifications: z.preprocess(toList, z.array(z.string().min(1))),
    datasheet_url: z.preprocess((v) => (typeof v === 'string' ? v.trim() : v), z.union([z.literal(''), z.url()])),
    specifications: z.preprocess(fromText, labelValue),
    features: z.preprocess(fromText, z.array(z.object({ title: z.string().min(1), description: z.string().optional() }))),
    details: z.preprocess(fromText, z.array(z.object({ label: z.string().min(1), value: z.string().optional(), asList: z.boolean().optional() }))),
    badge: z.string(),
    unit: z.string(),
    brief: z.string(),
    featured: z.preprocess(toBoolean, z.boolean()),
    rating: z.preprocess((v) => blankToNull(toNumber(v)), z.number().min(0).max(5).nullable()),
    review_count: z.preprocess(toNumber, z.number().int().min(0)),
  })
  .partial()
  .loose()

/**
 * Checks and tidies the metadata sent with a product create or update.
 * A key set to null stays null: that is how Medusa removes a metadata key.
 */
export function normalizeProductMetadata(input: Record<string, unknown>): { value: Record<string, unknown> } | { error: string } {
  const removed = Object.keys(input).filter((key) => input[key] === null)
  const kept = Object.fromEntries(Object.entries(input).filter(([, v]) => v !== null))
  const parsed = productFieldsSchema.safeParse(kept)
  if (!parsed.success) {
    return { error: parsed.error.issues.map((issue) => `${issue.path.join('.') || 'metadata'}: ${issue.message}`).join('; ') }
  }
  return { value: { ...parsed.data, ...Object.fromEntries(removed.map((key) => [key, null])) } }
}
