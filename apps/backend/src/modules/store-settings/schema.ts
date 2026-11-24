import { z } from 'zod'

/** What the admin may change. Every field is optional, and anything else is rejected. */
export const settingsUpdateSchema = z
  .object({
    default_min_order_qty: z.number().int().min(1).max(100000),
    price_visibility: z.enum(['everyone', 'logged_in']),
    purchase_access: z.enum(['logged_in', 'everyone']),
    enquiry_email: z.email(),
    shipping_mode: z.enum(['placeholder', 'shiprocket']),
    tax_mode: z.enum(['placeholder', 'gst']),
  })
  .partial()
  .strict()

export type SettingsUpdate = z.infer<typeof settingsUpdateSchema>

/** The settings the website may read. The enquiry email stays internal. */
export const PUBLIC_FIELDS = ['default_min_order_qty', 'price_visibility', 'purchase_access', 'shipping_mode', 'tax_mode'] as const
