import { authenticate, defineMiddlewares } from '@medusajs/framework/http'

export default defineMiddlewares({
  routes: [
    // Changing a password needs a signed-in customer (the token the website keeps in its cookie).
    {
      method: ['POST'],
      matcher: '/store/customers/me/password',
      middlewares: [authenticate('customer', ['session', 'bearer'])],
    },
  ],
})
