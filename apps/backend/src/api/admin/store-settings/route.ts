import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http'
import { MedusaError } from '@medusajs/framework/utils'
import { STORE_SETTINGS_MODULE } from '../../../modules/store-settings'
import type StoreSettingsService from '../../../modules/store-settings/service'
import { settingsUpdateSchema } from '../../../modules/store-settings/schema'

/** GET /admin/store-settings: every setting. */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const service: StoreSettingsService = req.scope.resolve(STORE_SETTINGS_MODULE)
  res.json({ settings: await service.getSettings() })
}

/** POST /admin/store-settings: change any of the settings; the rest stay as they are. */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const parsed = settingsUpdateSchema.safeParse(req.body)
  if (!parsed.success) {
    const why = parsed.error.issues.map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`).join('; ')
    throw new MedusaError(MedusaError.Types.INVALID_DATA, `Store settings: ${why}`)
  }
  const service: StoreSettingsService = req.scope.resolve(STORE_SETTINGS_MODULE)
  res.json({ settings: await service.updateSettings(parsed.data) })
}
