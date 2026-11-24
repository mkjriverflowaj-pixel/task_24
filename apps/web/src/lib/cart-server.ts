import { cookies } from 'next/headers';
import { emptyCart, type CartData, type Customer, type OrderData } from './cart-types';

/**
 * Server side of the cart, checkout and orders. Everything is a real Medusa cart and order: the website's /api/cart,
 * /api/checkout and /api/orders routes call Medusa's store API. The cart id is kept in an httpOnly cookie; when a shopper is
 * signed in their login token is sent too, so the cart and the order belong to their account.
 *
 *   cart       POST /store/carts, line items, promotions
 *   checkout   cart email and addresses, a shipping method, a payment session (pay on delivery), then /complete
 *   orders     GET /store/orders (the shopper's own list) and /store/orders/:id
 */
const MEDUSA = process.env.MEDUSA_URL ?? 'http://localhost:9000';
const KEY = process.env.MEDUSA_PUBLISHABLE_KEY ?? '';
const CART = 'sx_cart';
const LAST_ORDER = 'sx_order';
const TOKEN = 'sx_at';
const COOKIE = { httpOnly: true, sameSite: 'lax' as const, secure: process.env.NODE_ENV === 'production', path: '/' };

export class CartError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

async function medusa<T = any>(path: string, init: { method?: string; body?: unknown; token?: string } = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${MEDUSA}${path}`, {
      method: init.method ?? 'GET',
      headers: {
        'content-type': 'application/json',
        'x-publishable-api-key': KEY,
        ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
      },
      body: init.body ? JSON.stringify(init.body) : undefined,
      cache: 'no-store',
    });
  } catch {
    throw new CartError('The shop is not reachable right now. Please try again in a moment.', 503);
  }
  const data = (await res.json().catch(() => ({}))) as any;
  if (!res.ok) {
    const text = String(data?.message ?? '');
    if (data?.code === 'insufficient_inventory' || /inventory/i.test(text)) throw new CartError('We do not have that many in stock.', 409);
    if (/promotion code/i.test(text)) throw new CartError('That code is not valid.', 400);
    throw new CartError(text || 'Something went wrong. Please try again.', res.status === 404 ? 404 : 400);
  }
  return data as T;
}

const CART_FIELDS = '+items.product_handle,+items.thumbnail,+items.metadata,+promotions.code,+shipping_methods.id,+shipping_methods.shipping_option_id,+customer_id,+payment_collection.id';

const rupees = (value: unknown) => (typeof value === 'number' && Number.isFinite(value) ? value : 0);

function address(a: any, email: string | null): Customer | null {
  if (!a?.address_1) return null;
  return {
    name: [a.first_name, a.last_name].filter(Boolean).join(' '),
    email: email ?? '',
    phone: a.phone ?? '',
    address: a.address_1 ?? '',
    city: a.city ?? '',
    state: a.province ?? '',
    pincode: a.postal_code ?? '',
  };
}

function shapeCart(cart: any): CartData {
  const chosen = (cart.shipping_methods ?? []).length > 0;
  return {
    items: (cart.items ?? []).map((line: any) => ({
      id: line.id,
      variantId: line.variant_id,
      slug: line.product_handle ?? '',
      name: line.product_title ?? line.title,
      price: rupees(line.unit_price),
      mrp: typeof line.metadata?.mrp === 'number' ? line.metadata.mrp : null,
      image: line.thumbnail ?? null,
      unit: typeof line.metadata?.unit === 'string' ? line.metadata.unit : null,
      qty: line.quantity,
    })),
    subtotal: rupees(cart.item_subtotal ?? cart.subtotal),
    discount: rupees(cart.discount_total),
    shipping: chosen ? rupees(cart.shipping_total) : 0,
    shippingChosen: chosen,
    total: rupees(cart.total),
    coupon: cart.promotions?.[0]?.code ?? null,
    email: cart.email ?? null,
    address: address(cart.shipping_address, cart.email ?? null),
  };
}

async function token() {
  return (await cookies()).get(TOKEN)?.value;
}

let regionCache: Promise<string> | undefined;
const regionId = () =>
  (regionCache ??= medusa<{ regions: { id: string; currency_code: string }[] }>('/store/regions')
    .then(({ regions }) => (regions.find((r) => r.currency_code === 'inr') ?? regions[0]).id)
    .catch((error) => {
      regionCache = undefined;
      throw error;
    }));

/** The visitor's open cart (Medusa object), or null. A finished or missing cart is forgotten. */
async function openCart(): Promise<any | null> {
  const jar = await cookies();
  const id = jar.get(CART)?.value;
  if (!id) return null;
  try {
    const { cart } = await medusa(`/store/carts/${id}?fields=${encodeURIComponent(CART_FIELDS)}`);
    if (cart.completed_at) throw new CartError('done', 404);
    // A shopper who signed in after filling the cart: the cart now belongs to them.
    const t = await token();
    if (t && !cart.customer_id) await medusa(`/store/carts/${id}/customer`, { method: 'POST', token: t }).catch(() => null);
    return cart;
  } catch (error) {
    if (error instanceof CartError && error.status === 404) {
      jar.delete(CART);
      return null;
    }
    throw error;
  }
}

async function ensureCart(): Promise<any> {
  const existing = await openCart();
  if (existing) return existing;
  const { cart } = await medusa('/store/carts', { method: 'POST', body: { region_id: await regionId() }, token: await token() });
  (await cookies()).set(CART, cart.id, { ...COOKIE, maxAge: 60 * 60 * 24 * 30 });
  return cart;
}

const reload = async (id: string) => shapeCart((await medusa(`/store/carts/${id}?fields=${encodeURIComponent(CART_FIELDS)}`)).cart);

export async function getCart(): Promise<CartData> {
  const cart = await openCart();
  return cart ? shapeCart(cart) : emptyCart;
}

export async function addItem(variantId: string, quantity: number, metadata: Record<string, unknown>): Promise<CartData> {
  const cart = await ensureCart();
  await medusa(`/store/carts/${cart.id}/line-items`, { method: 'POST', body: { variant_id: variantId, quantity, metadata } });
  return reload(cart.id);
}

export async function setQuantity(lineId: string, quantity: number): Promise<CartData> {
  const cart = await openCart();
  if (!cart) return emptyCart;
  if (quantity <= 0) await medusa(`/store/carts/${cart.id}/line-items/${lineId}`, { method: 'DELETE' });
  else await medusa(`/store/carts/${cart.id}/line-items/${lineId}`, { method: 'POST', body: { quantity } });
  return reload(cart.id);
}

export async function removeItem(lineId: string): Promise<CartData> {
  return setQuantity(lineId, 0);
}

/** Starts over with an empty cart. */
export async function clearCart(): Promise<CartData> {
  (await cookies()).delete(CART);
  return emptyCart;
}

export async function applyPromo(code: string): Promise<CartData> {
  const cart = await ensureCart();
  const have = (cart.promotions ?? []).map((p: any) => p.code).filter(Boolean);
  await medusa(`/store/carts/${cart.id}`, { method: 'POST', body: { promo_codes: [...new Set([...have, code.trim().toUpperCase()])] } });
  return reload(cart.id);
}

export async function removePromo(code: string): Promise<CartData> {
  const cart = await openCart();
  if (!cart) return emptyCart;
  await medusa(`/store/carts/${cart.id}/promotions`, { method: 'DELETE', body: { promo_codes: [code] } });
  return reload(cart.id);
}

/** Picks the delivery method for the cart (there is one: Standard) and returns the cart with the delivery charge. */
async function chooseShipping(cartId: string): Promise<void> {
  const { shipping_options: options } = await medusa<{ shipping_options: any[] }>(`/store/shipping-options?cart_id=${cartId}`);
  const standard = options.find((o) => /standard/i.test(o.name)) ?? options[0];
  if (!standard) throw new CartError('We do not deliver to that address yet.', 400);
  await medusa(`/store/carts/${cartId}/shipping-methods`, { method: 'POST', body: { option_id: standard.id } });
}

/** Checkout step 1: the contact and delivery details, and the delivery method. */
export async function setAddress(c: Customer): Promise<CartData> {
  const cart = await openCart();
  if (!cart || (cart.items ?? []).length === 0) throw new CartError('Your cart is empty.', 400);
  const [first, ...rest] = c.name.trim().split(/\s+/);
  const a = {
    first_name: first,
    last_name: rest.join(' ') || '-',
    address_1: c.address.trim(),
    city: c.city.trim(),
    province: c.state.trim(),
    postal_code: c.pincode.trim(),
    country_code: 'in',
    phone: c.phone.trim(),
  };
  await medusa(`/store/carts/${cart.id}`, { method: 'POST', body: { email: c.email.trim().toLowerCase(), shipping_address: a, billing_address: a } });
  await chooseShipping(cart.id);
  return reload(cart.id);
}

/** Checkout step 2: pay on delivery. Turns the cart into an order. */
export async function placeOrder(): Promise<{ orderId: string; number: number }> {
  const cart = await openCart();
  if (!cart || (cart.items ?? []).length === 0) throw new CartError('Your cart is empty.', 400);
  if (!cart.email || !cart.shipping_address?.address_1) throw new CartError('Please add your delivery details first.', 400);
  // Prices and the delivery charge are re-checked just before the order is placed.
  await chooseShipping(cart.id);

  let collectionId: string | undefined = cart.payment_collection?.id;
  if (!collectionId) collectionId = (await medusa('/store/payment-collections', { method: 'POST', body: { cart_id: cart.id } })).payment_collection.id;
  await medusa(`/store/payment-collections/${collectionId}/payment-sessions`, { method: 'POST', body: { provider_id: 'pp_system_default' } });

  const done = await medusa(`/store/carts/${cart.id}/complete`, { method: 'POST' });
  if (done.type !== 'order') throw new CartError(done.error?.message ?? 'We could not place your order. Please check your cart and try again.', 409);

  const jar = await cookies();
  jar.delete(CART);
  jar.set(LAST_ORDER, done.order.id, { ...COOKIE, maxAge: 60 * 60 * 24 });
  return { orderId: done.order.id, number: done.order.display_id };
}

const ORDER_FIELDS = '*items,+items.product_handle,+items.thumbnail,*shipping_address,+payment_status,+fulfillment_status,+display_id,+promotions.code,+customer_id';

function shapeOrder(order: any): OrderData {
  return {
    id: order.id,
    number: order.display_id,
    placedAt: order.created_at,
    status: order.status,
    paymentStatus: order.payment_status ?? '',
    fulfillmentStatus: order.fulfillment_status ?? '',
    items: (order.items ?? []).map((line: any) => ({
      id: line.id,
      slug: line.product_handle ?? '',
      name: line.product_title ?? line.title,
      price: rupees(line.unit_price),
      image: line.thumbnail ?? null,
      qty: line.quantity,
    })),
    subtotal: rupees(order.item_subtotal ?? order.subtotal),
    discount: rupees(order.discount_total),
    shipping: rupees(order.shipping_total),
    total: rupees(order.total),
    coupon: order.promotions?.[0]?.code ?? null,
    payment: 'Cash on delivery', // the only payment method for now
    customer: address(order.shipping_address, order.email ?? null) ?? { name: '', email: order.email ?? '', phone: '', address: '', city: '', state: '', pincode: '' },
  };
}

/** One order, only for the shopper who just placed it or the signed-in customer it belongs to. */
export async function getOrder(id: string): Promise<OrderData | null> {
  const jar = await cookies();
  const t = await token();
  let allowed = jar.get(LAST_ORDER)?.value === id;
  let customerId: string | undefined;
  if (t && !allowed) {
    const me = await medusa('/store/customers/me', { token: t }).catch(() => null);
    customerId = me?.customer?.id;
  }
  try {
    const { order } = await medusa(`/store/orders/${id}?fields=${encodeURIComponent(ORDER_FIELDS)}`, { token: t });
    if (!allowed && customerId && order.customer_id === customerId) allowed = true;
    return allowed ? shapeOrder(order) : null;
  } catch (error) {
    if (error instanceof CartError && error.status === 404) return null;
    throw error;
  }
}

/** The signed-in shopper's own orders, newest first. Empty when nobody is signed in. */
export async function listOrders(): Promise<OrderData[]> {
  const t = await token();
  if (!t) return [];
  try {
    const { orders } = await medusa<{ orders: any[] }>(`/store/orders?limit=30&order=-created_at&fields=${encodeURIComponent(ORDER_FIELDS)}`, { token: t });
    return orders.map(shapeOrder);
  } catch {
    return [];
  }
}
