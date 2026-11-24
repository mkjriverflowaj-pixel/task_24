import { ContainerRegistrationKeys, MedusaError } from '@medusajs/framework/utils'
import type { MedusaContainer } from '@medusajs/framework/types'
import { STORE_SETTINGS_MODULE } from '../modules/store-settings'
import type StoreSettingsService from '../modules/store-settings/service'

/**
 * The buying rules the brief asks for, kept in one place so add to cart, quantity change and checkout all agree:
 *
 *   - minimum order quantity: the product's own `min_order_qty` (product metadata), else the store default
 *   - login required to buy: when the store setting `purchase_access` is "logged_in" (the default), only a cart that
 *     belongs to a registered account can be completed. (Medusa also creates a customer record for a guest who only
 *     typed an email, so "has a customer" is not enough: the customer must have an account.)
 *
 * Both read the store settings (src/modules/store-settings), so the Safonix team changes them without code.
 * They are applied by the hooks in src/workflows/hooks/purchase-rules.ts.
 */

type Query = { graph: (config: Record<string, unknown>) => Promise<{ data: any[] }> } // eslint-disable-line @typescript-eslint/no-explicit-any

const queryOf = (container: MedusaContainer): Query => container.resolve(ContainerRegistrationKeys.QUERY) as unknown as Query

const invalid = (message: string) => new MedusaError(MedusaError.Types.INVALID_DATA, message)

/** The cart's id, owner and lines. */
async function loadCart(container: MedusaContainer, cartId: string) {
  const { data } = await queryOf(container).graph({
    entity: 'cart',
    fields: ['id', 'customer_id', 'customer.has_account', 'items.id', 'items.variant_id', 'items.quantity'],
    filters: { id: cartId },
  })
  if (!data[0]) throw new MedusaError(MedusaError.Types.NOT_FOUND, `Cart ${cartId} was not found.`)
  return data[0] as { id: string; customer_id: string | null; customer?: { has_account: boolean } | null; items: { id: string; variant_id: string; quantity: number }[] }
}

/** Fails when a line is below the minimum order quantity of its product. */
async function checkMinimums(container: MedusaContainer, lines: { variant_id: string; quantity: number }[]) {
  if (!lines.length) return
  const settings: StoreSettingsService = container.resolve(STORE_SETTINGS_MODULE)
  const fallback = (await settings.getSettings()).default_min_order_qty
  const { data: variants } = await queryOf(container).graph({
    entity: 'variant',
    fields: ['id', 'product.title', 'product.metadata'],
    filters: { id: lines.map((line) => line.variant_id) },
  })
  for (const line of lines) {
    const variant = variants.find((v) => v.id === line.variant_id)
    const own = Number(variant?.product?.metadata?.min_order_qty)
    const minimum = Number.isInteger(own) && own >= 1 ? own : fallback
    if (line.quantity < minimum) {
      throw invalid(`The minimum order for "${variant?.product?.title ?? 'this product'}" is ${minimum}.`)
    }
  }
}

/** Adding to a cart: the quantity after adding (what is already in the cart plus the new amount) must reach the minimum. */
export async function checkAddToCart(container: MedusaContainer, cartId: string, items: { variant_id?: string; quantity: number }[]) {
  const cart = await loadCart(container, cartId)
  const total = new Map<string, number>()
  for (const line of cart.items ?? []) total.set(line.variant_id, (total.get(line.variant_id) ?? 0) + line.quantity)
  for (const item of items) if (item.variant_id) total.set(item.variant_id, (total.get(item.variant_id) ?? 0) + item.quantity)
  const touched = new Set(items.map((item) => item.variant_id).filter(Boolean) as string[])
  await checkMinimums(container, [...total].filter(([variant]) => touched.has(variant)).map(([variant_id, quantity]) => ({ variant_id, quantity })))
}

/** Changing a line's quantity. A quantity of 0 is a removal and is always allowed. */
export async function checkLineQuantity(container: MedusaContainer, cartId: string, itemId: string, quantity: number | undefined) {
  if (!quantity) return
  const cart = await loadCart(container, cartId)
  const line = cart.items?.find((item) => item.id === itemId)
  if (line) await checkMinimums(container, [{ variant_id: line.variant_id, quantity }])
}

/** Placing the order: the cart needs an owner (unless the store allows guests) and every line must meet its minimum. */
export async function checkCheckout(container: MedusaContainer, cartId: string) {
  const cart = await loadCart(container, cartId)
  const settings: StoreSettingsService = container.resolve(STORE_SETTINGS_MODULE)
  if ((await settings.getSettings()).purchase_access === 'logged_in' && !cart.customer?.has_account) {
    throw invalid('Please sign in or register to place an order.')
  }
  await checkMinimums(container, (cart.items ?? []).map(({ variant_id, quantity }) => ({ variant_id, quantity })))
}
