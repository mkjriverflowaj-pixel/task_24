import { authenticate, defineMiddlewares } from '@medusajs/framework/http'
import type { MedusaNextFunction, MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import { normalizeProductMetadata } from '../lib/product-fields'

/**
 * Runs before an admin product is created or edited. The extra product fields (MRP, GST rate, minimum order quantity,
 * certifications, datasheet link, specifications ...) are product metadata; this turns what the admin typed into the
 * right type and rejects nonsense, so the website never has to guess. See src/lib/product-fields.ts.
 */
async function checkProductFields(req: MedusaRequest, _res: MedusaResponse, next: MedusaNextFunction) {
  // Medusa's own validator may or may not have run yet, so fix both copies of the body.
  const bodies = [req.body, (req as { validatedBody?: unknown }).validatedBody] as ({ metadata?: Record<string, unknown> | null } | undefined)[]
  for (const body of bodies) {
    if (!body?.metadata || typeof body.metadata !== 'object') continue
    const result = normalizeProductMetadata(body.metadata)
    if ('error' in result) throw new MedusaError(MedusaError.Types.INVALID_DATA, `Product fields: ${result.error}`)
    body.metadata = result.value
  }
  next()
}

export default defineMiddlewares({
  routes: [
    // Changing a password needs a signed-in customer (the token the website keeps in its cookie).
    {
      method: ['POST'],
      matcher: '/store/customers/me/password',
      middlewares: [authenticate('customer', ['session', 'bearer'])],
    },
    { method: ['POST'], matcher: '/admin/products', middlewares: [checkProductFields] },
    { method: ['POST'], matcher: '/admin/products/:id', middlewares: [checkProductFields] },
  ],
})
