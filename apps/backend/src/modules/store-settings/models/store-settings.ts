import { model } from '@medusajs/framework/utils'

/**
 * Store-wide switches the Safonix team can change in the admin instead of in code. One row only.
 *
 *   default_min_order_qty  minimum order quantity for a product that does not set its own
 *   price_visibility       who sees prices: "everyone" or only "logged_in" shoppers
 *   purchase_access        who can buy: only "logged_in" shoppers (the brief: no guest checkout) or "everyone"
 *   enquiry_email          where Dealer & Distributor enquiries and contact messages are sent
 *   shipping_mode          "placeholder" fixed values now, "shiprocket" once that is connected (Phase 2)
 *   tax_mode               "placeholder" now, "gst" once the real GST set-up is done (Phase 2)
 */
const StoreSettings = model.define('store_settings', {
  id: model.id().primaryKey(),
  default_min_order_qty: model.number().default(1),
  price_visibility: model.enum(['everyone', 'logged_in']).default('everyone'),
  purchase_access: model.enum(['logged_in', 'everyone']).default('logged_in'),
  enquiry_email: model.text().default('enquiries@example.com'),
  shipping_mode: model.enum(['placeholder', 'shiprocket']).default('placeholder'),
  tax_mode: model.enum(['placeholder', 'gst']).default('placeholder'),
})

export default StoreSettings
