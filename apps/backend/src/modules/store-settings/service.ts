import { MedusaService } from '@medusajs/framework/utils'
import StoreSettings from './models/store-settings'
import type { SettingsUpdate } from './schema'

const ROW_ID = 'sset_default'

class StoreSettingsService extends MedusaService({ StoreSettings }) {
  /** The one settings row. Created with the defaults the first time it is asked for. */
  async getSettings() {
    const find = async () => (await this.listStoreSettings({ id: ROW_ID }, { take: 1 }))[0]
    const existing = await find()
    if (existing) return existing
    try {
      return await this.createStoreSettings({ id: ROW_ID })
    } catch (error) {
      // Two requests created it at the same moment; the other one won.
      const created = await find()
      if (created) return created
      throw error
    }
  }

  async updateSettings(changes: SettingsUpdate) {
    await this.getSettings()
    return await this.updateStoreSettings({ id: ROW_ID, ...changes })
  }
}

export default StoreSettingsService
