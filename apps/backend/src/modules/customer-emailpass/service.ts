import { AbstractAuthModuleProvider, MedusaError, isPresent, isString } from '@medusajs/framework/utils'

/* eslint-disable @typescript-eslint/no-explicit-any */
let scryptKdf: any
// scrypt-kdf is ESM-only, so it is loaded on first use.
async function loadScrypt() {
  if (!scryptKdf) {
    const mod: any = await import('scrypt-kdf')
    scryptKdf = mod.default ?? mod
  }
  return scryptKdf
}

type Options = { hashConfig?: { logN: number; r: number; p: number } }

/**
 * The website customers' own email-and-password login ("customer-emailpass").
 *
 * It behaves like Medusa's built-in "emailpass" login but is a separate provider, so passwords are stored apart from the
 * admin dashboard's. The same email can be an admin and a shopper with two unrelated passwords, and a shopper password
 * can never open the admin (see authMethodsPerActor in medusa-config.ts).
 */
export default class CustomerEmailPassService extends AbstractAuthModuleProvider {
  static identifier = 'customer-emailpass'
  static DISPLAY_NAME = 'Customer email and password'

  protected config_: Options

  constructor(container: Record<string, unknown>, options: Options) {
    // @ts-expect-error the base class takes the whole argument list
    super(...arguments)
    this.config_ = options ?? {}
  }

  protected async hashPassword(password: string) {
    const scrypt = await loadScrypt()
    const hash = await scrypt.kdf(password, this.config_.hashConfig ?? { logN: 15, r: 8, p: 1 })
    return Buffer.from(hash).toString('base64')
  }

  protected providerIdentity(authIdentity: any) {
    return authIdentity?.provider_identities?.find((pi: any) => pi.provider === this.provider)
  }

  protected sanitize(authIdentity: any) {
    const copy = JSON.parse(JSON.stringify(authIdentity))
    const identity = this.providerIdentity(copy)
    if (identity?.provider_metadata) delete identity.provider_metadata.password
    return copy
  }

  protected async passwordMatches(password: string, authIdentity: any) {
    const hash = this.providerIdentity(authIdentity)?.provider_metadata?.password
    if (!isString(hash)) return false
    const scrypt = await loadScrypt()
    return scrypt.verify(Buffer.from(hash, 'base64'), password)
  }

  async authenticate(data: any, authIdentityService: any) {
    const { email, password } = data.body ?? {}
    if (!password || !isString(password)) return { success: false, error: 'Password should be a string' }
    if (!email || !isString(email)) return { success: false, error: 'Email should be a string' }

    let authIdentity
    try {
      authIdentity = await authIdentityService.retrieve({ entity_id: email })
    } catch (error: any) {
      if (error.type === MedusaError.Types.NOT_FOUND) return { success: false, error: 'Invalid email or password' }
      return { success: false, error: error.message }
    }
    if (await this.passwordMatches(password, authIdentity)) return { success: true, authIdentity: this.sanitize(authIdentity) }
    return { success: false, error: 'Invalid email or password' }
  }

  async register(data: any, authIdentityService: any) {
    const { email, password } = data.body ?? {}
    if (!password || !isString(password)) return { success: false, error: 'Password should be a string' }
    if (!email || !isString(email)) return { success: false, error: 'Email should be a string' }

    try {
      const existing = await authIdentityService.retrieve({ entity_id: email })
      // A sign-up that stopped half way (login saved, no profile yet) can be finished with the same password.
      if (!isPresent(existing.app_metadata) && (await this.passwordMatches(password, existing))) {
        return { success: true, authIdentity: this.sanitize(existing) }
      }
      return { success: false, error: 'Identity with email already exists' }
    } catch (error: any) {
      if (error.type === MedusaError.Types.NOT_FOUND) {
        const created = await authIdentityService.create({ entity_id: email, provider_metadata: { password: await this.hashPassword(password) } })
        return { success: true, authIdentity: this.sanitize(created) }
      }
      return { success: false, error: error.message }
    }
  }

  async update(data: any, authIdentityService: any) {
    const { password, entity_id } = data ?? {}
    if (!entity_id) return { success: false, error: `Cannot update ${this.provider} provider identity without entity_id` }
    if (!password || !isString(password)) return { success: true }
    try {
      const current = await authIdentityService.retrieve({ entity_id })
      const updated = await authIdentityService.update(entity_id, {
        provider_metadata: { ...(this.providerIdentity(current)?.provider_metadata ?? {}), password: await this.hashPassword(password) },
      })
      return { success: true, authIdentity: this.sanitize(updated) }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }
}
