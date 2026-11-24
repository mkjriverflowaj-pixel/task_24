import { addToCartWorkflow, completeCartWorkflow, updateLineItemInCartWorkflow } from '@medusajs/medusa/core-flows'
import { checkAddToCart, checkCheckout, checkLineQuantity } from '../../lib/purchase-rules'

// Medusa runs these hooks before it changes the cart. Throwing stops the action and the shopper sees the message.
// The rules themselves are in src/lib/purchase-rules.ts.

addToCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  const { cart_id, items } = input as unknown as { cart_id: string; items: { variant_id?: string; quantity: number }[] }
  await checkAddToCart(container, cart_id, items ?? [])
})

updateLineItemInCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  const { cart_id, item_id, update } = input as unknown as { cart_id: string; item_id: string; update: { quantity?: number } }
  await checkLineQuantity(container, cart_id, item_id, update?.quantity)
})

completeCartWorkflow.hooks.validate(async ({ input }, { container }) => {
  await checkCheckout(container, (input as unknown as { id: string }).id)
})
