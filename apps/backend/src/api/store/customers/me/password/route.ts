import type { AuthenticatedMedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { Modules } from '@medusajs/framework/utils'

type Body = { current_password?: string; new_password?: string }

/**
 * POST /store/customers/me/password
 * A signed-in customer changes their own password. The current password must be right, and the new one at least 8 characters.
 * (Medusa's built-in password update only works from an emailed reset link; this is the in-account version.)
 */
export async function POST(req: AuthenticatedMedusaRequest<Body>, res: MedusaResponse) {
  const { current_password: current, new_password: next } = req.body ?? {}
  if (!current || !next) return res.status(400).json({ message: 'Enter your current and new password.' })
  if (next.length < 8) return res.status(400).json({ message: 'Use at least 8 characters for the new password.' })

  const customers = req.scope.resolve(Modules.CUSTOMER)
  const auth = req.scope.resolve(Modules.AUTH)

  const customer = await customers.retrieveCustomer(req.auth_context.actor_id)

  const check = await auth.authenticate('customer-emailpass', { body: { email: customer.email, password: current } } as never)
  if (!check.success) return res.status(401).json({ message: 'Your current password is not correct.' })

  const updated = await auth.updateProvider('customer-emailpass', { entity_id: customer.email, password: next })
  if (!updated.success) return res.status(400).json({ message: 'We could not change your password.' })

  res.json({ success: true })
}
