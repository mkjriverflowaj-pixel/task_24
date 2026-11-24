import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { STORE_SETTINGS_MODULE } from '../../../modules/store-settings'
import type StoreSettingsService from '../../../modules/store-settings/service'
import { PUBLIC_FIELDS } from '../../../modules/store-settings/schema'

/** GET /store/store-settings: the settings the website needs (read only). */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: StoreSettingsService = req.scope.resolve(STORE_SETTINGS_MODULE)
  const settings = await service.getSettings()
  res.json({ settings: Object.fromEntries(PUBLIC_FIELDS.map((key) => [key, settings[key]])) })
}
