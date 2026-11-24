import type { ExecArgs } from '@medusajs/framework/types'
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'
import {
  createApiKeysWorkflow,
  createPromotionsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createStoresWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateShippingOptionsWorkflow,
  updateStoresWorkflow,
} from '@medusajs/medusa/core-flows'

/**
 * One-time (and safe to run again) setup of the Safonix store: Indian rupees, an India region, a sales channel, a
 * warehouse with delivery, and the publishable API key the storefront uses.
 *
 *   npm run seed
 *
 * Products are not created here: add them in the admin dashboard or import them (Medusa's Product module owns them).
 */
export default async function seedStore({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const fulfillment = container.resolve(Modules.FULFILLMENT)

  // 1. Sales channel: where products are sold. The storefront's API key is tied to it.
  let { data: channels } = await query.graph({ entity: 'sales_channel', fields: ['id', 'name'], filters: { name: 'Safonix Web Store' } })
  if (!channels.length) {
    const { result } = await createSalesChannelsWorkflow(container).run({
      input: { salesChannelsData: [{ name: 'Safonix Web Store', description: 'The Safonix website' }] },
    })
    channels = result as unknown as typeof channels
    logger.info('Created sales channel "Safonix Web Store".')
  }
  const channel = channels[0]

  // 2. Store: name, rupees as the only currency, default channel.
  const { data: stores } = await query.graph({ entity: 'store', fields: ['id'] })
  const storeData = {
    name: 'Safonix India',
    supported_currencies: [{ currency_code: 'inr', is_default: true }],
    default_sales_channel_id: channel.id,
  }
  if (stores.length) {
    await updateStoresWorkflow(container).run({ input: { selector: { id: stores[0].id }, update: storeData } })
    logger.info('Updated the store (INR).')
  } else {
    await createStoresWorkflow(container).run({ input: { stores: [storeData] } })
    logger.info('Created the store (INR).')
  }

  // 3. Region and tax region: India. Prices are entered as final, tax-inclusive rupee prices, so no extra tax is added here.
  let { data: regions } = await query.graph({ entity: 'region', fields: ['id', 'name'], filters: { name: 'India' } })
  if (!regions.length) {
    const { result } = await createRegionsWorkflow(container).run({
      input: { regions: [{ name: 'India', currency_code: 'inr', countries: ['in'], payment_providers: ['pp_system_default'] }] },
    })
    regions = result as unknown as typeof regions
    logger.info('Created region India.')
  }
  const region = regions[0]

  const { data: taxRegions } = await query.graph({ entity: 'tax_region', fields: ['id'], filters: { country_code: 'in' } })
  if (!taxRegions.length) {
    await createTaxRegionsWorkflow(container).run({ input: [{ country_code: 'in', provider_id: 'tp_system' }] })
    logger.info('Created tax region India.')
  }

  // 4. Warehouse, delivery zone and shipping options.
  let { data: locations } = await query.graph({ entity: 'stock_location', fields: ['id', 'name'], filters: { name: 'Safonix Warehouse' } })
  if (!locations.length) {
    const { result } = await createStockLocationsWorkflow(container).run({
      input: {
        locations: [
          { name: 'Safonix Warehouse', address: { city: 'Jaipur', country_code: 'IN', address_1: '103/74, Meera Marg, Sector 101, Mansarovar', postal_code: '302020' } },
        ],
      },
    })
    locations = result as unknown as typeof locations
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: result[0].id },
      [Modules.FULFILLMENT]: { fulfillment_provider_id: 'manual_manual' },
    })
    await linkSalesChannelsToStockLocationWorkflow(container).run({ input: { id: result[0].id, add: [channel.id] } })
    logger.info('Created warehouse "Safonix Warehouse".')

    let { data: profiles } = await query.graph({ entity: 'shipping_profile', fields: ['id'] })
    if (!profiles.length) {
      const { result: created } = await createShippingProfilesWorkflow(container).run({
        input: { data: [{ name: 'Default shipping profile', type: 'default' }] },
      })
      profiles = created as unknown as typeof profiles
    }

    const set = await fulfillment.createFulfillmentSets({
      name: 'Safonix Warehouse delivery',
      type: 'shipping',
      service_zones: [{ name: 'India', geo_zones: [{ country_code: 'in', type: 'country' }] }],
    })
    await link.create({
      [Modules.STOCK_LOCATION]: { stock_location_id: result[0].id },
      [Modules.FULFILLMENT]: { fulfillment_set_id: set.id },
    })

    const rules = [
      { attribute: 'enabled_in_store', value: 'true', operator: 'eq' as const },
      { attribute: 'is_return', value: 'false', operator: 'eq' as const },
    ]
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: 'Standard delivery',
          price_type: 'flat',
          provider_id: 'manual_manual',
          service_zone_id: set.service_zones[0].id,
          shipping_profile_id: profiles[0].id,
          type: { label: 'Standard', description: 'Delivered in 3 to 5 working days.', code: 'standard' },
          prices: [
            { currency_code: 'inr', amount: 49 },
            { region_id: region.id, amount: 49 },
          ],
          rules,
        },
      ],
    })
    logger.info('Created delivery for India (Standard, INR 49).')
  }

  // Delivery is INR 49, free when the items come to INR 999 or more (the same rule the website always showed).
  const FREE_FROM = 999
  const { data: standard } = await query.graph({ entity: 'shipping_option', fields: ['id', 'name'], filters: { name: 'Standard delivery' } })
  if (standard.length) {
    await updateShippingOptionsWorkflow(container).run({
      input: [
        {
          id: standard[0].id,
          prices: [
            { currency_code: 'inr', amount: 49 },
            { region_id: region.id, amount: 49 },
            { currency_code: 'inr', amount: 0, rules: [{ attribute: 'item_total', operator: 'gte', value: FREE_FROM }] },
            { region_id: region.id, amount: 0, rules: [{ attribute: 'item_total', operator: 'gte', value: FREE_FROM }] },
          ],
        },
      ],
    })
    logger.info(`Delivery prices set: INR 49, free from INR ${FREE_FROM}.`)
  }

  // Coupon codes the website offers (percentage off the whole order). Created once.
  const COUPONS: [string, number][] = [
    ['SAFONIX10', 10],
    ['WELCOME5', 5],
  ]
  const { data: existingPromos } = await query.graph({ entity: 'promotion', fields: ['code'], filters: { code: COUPONS.map(([code]) => code) } })
  const have = new Set(existingPromos.map((promo: { code?: string | null }) => promo.code))
  for (const [code, percent] of COUPONS) {
    if (have.has(code)) continue
    await createPromotionsWorkflow(container).run({
      input: {
        promotionsData: [
          {
            code,
            type: 'standard',
            status: 'active',
            is_automatic: false,
            application_method: { type: 'percentage', target_type: 'order', allocation: 'across', value: percent, currency_code: 'inr' },
          },
        ],
      },
    })
    logger.info(`Created coupon ${code} (${percent}% off).`)
  }

  // The store's defaults (shown under Settings > Store): the India region and the warehouse.
  const { data: storeNow } = await query.graph({ entity: 'store', fields: ['id'] })
  await updateStoresWorkflow(container).run({
    input: { selector: { id: storeNow[0].id }, update: { default_region_id: region.id, default_location_id: locations[0].id } },
  })

  // 5. Publishable API key for the storefront.
  let { data: keys } = await query.graph({ entity: 'api_key', fields: ['id', 'title', 'token'], filters: { title: 'Safonix Storefront', type: 'publishable' } })
  if (!keys.length) {
    const { result } = await createApiKeysWorkflow(container).run({
      input: { api_keys: [{ title: 'Safonix Storefront', type: 'publishable', created_by: '' }] },
    })
    await linkSalesChannelsToApiKeyWorkflow(container).run({ input: { id: result[0].id, add: [channel.id] } })
    keys = result as unknown as typeof keys
    logger.info('Created the storefront publishable API key.')
  }

  logger.info('Store setup done.')
  logger.info(`Storefront publishable key: ${keys[0].token}`)
}
