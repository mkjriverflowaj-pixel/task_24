import { loadEnv, defineConfig, ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const redisUrl = process.env.REDIS_URL

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl,
    // Medusa turns SSL on in production by default; the bundled Postgres container has none.
    databaseDriverOptions:
      process.env.DATABASE_SSL === 'true'
        ? { connection: { ssl: { rejectUnauthorized: false } } }
        : { connection: { ssl: false } },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET,
      // Customers stay signed in on the website for two weeks (the website keeps the token in an httpOnly cookie).
      jwtExpiresIn: '14d',
      cookieSecret: process.env.COOKIE_SECRET,
      // Two separate logins: admin users sign in with "emailpass", website customers with "customer-emailpass".
      // Each keeps its own passwords, so the same email can exist in both without them touching each other.
      authMethodsPerActor: {
        user: ['emailpass'],
        customer: ['customer-emailpass'],
      },
    },
  },
  modules: [
    {
      resolve: '@medusajs/medusa/auth',
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
      options: {
        providers: [
          { resolve: '@medusajs/medusa/auth-emailpass', id: 'emailpass', options: {} },
          // Our own copy of the email/password login for shoppers (src/modules/customer-emailpass).
          { resolve: './src/modules/customer-emailpass', id: 'customer-emailpass', options: {} },
        ],
      },
    },
    // With Redis available, use it for events and workflows (required for production, optional in dev).
    ...(redisUrl
      ? [
          { key: Modules.EVENT_BUS, resolve: '@medusajs/medusa/event-bus-redis', options: { redisUrl } },
          { key: Modules.WORKFLOW_ENGINE, resolve: '@medusajs/medusa/workflow-engine-redis', options: { redis: { url: redisUrl } } },
        ]
      : []),
  ],
})
