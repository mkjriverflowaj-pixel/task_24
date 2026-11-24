'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { shippingFor } from '@/lib/format';
import { emptyCart, type CartData, type CartLine, type Customer } from '@/lib/cart-types';

export type CartItem = CartLine & { stock?: number | null };
export type { Customer };

/** What a product card or the product page hands over to put one in the cart. */
export type Buyable = { variantId: string; slug: string; name: string; price: number; mrp?: number | null; image?: string | null; unit?: string | null; stock?: number | null };

type Result = { ok: true } | { ok: false; message: string };

type Store = {
  ready: boolean;
  busy: boolean;
  /** The last problem with the cart (for example "We do not have that many in stock."), or null */
  error: string | null;
  items: CartItem[];
  count: number;
  subtotal: number;
  discount: number;
  shipping: number;
  /** false until the address step has chosen delivery: then `shipping` is an estimate */
  shippingChosen: boolean;
  total: number;
  coupon: string | null;
  add: (item: Buyable, qty?: number) => Promise<Result>;
  setQty: (lineId: string, qty: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
  clear: () => Promise<void>;
  applyCoupon: (code: string) => Promise<Result>;
  removeCoupon: () => Promise<void>;
  /** Puts the cart returned by a checkout step into the store. */
  setCart: (cart: CartData) => void;
  wishlist: string[];
  toggleWish: (slug: string) => void;
  isWished: (slug: string) => boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const Ctx = createContext<Store | null>(null);

export const useStore = () => {
  const store = useContext(Ctx);
  if (!store) throw new Error('useStore must be used inside <StoreProvider>');
  return store;
};

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key: string, value: unknown) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode or full storage: the wishlist then lives for this visit only */
  }
};

async function request(url: string, method = 'GET', body?: unknown): Promise<{ ok: boolean; data: CartData & { message?: string } }> {
  try {
    const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' });
    return { ok: res.ok, data: (await res.json().catch(() => ({}))) as CartData & { message?: string } };
  } catch {
    return { ok: false, data: { ...emptyCart, message: 'Network problem. Please check your connection and try again.' } };
  }
}

/**
 * Cart and coupon for the whole site, kept in Medusa: every change goes to the website's /api/cart routes, which talk to a real
 * Medusa cart. The cart id lives in an httpOnly cookie. The wishlist is still kept in the visitor's browser (localStorage).
 */
export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCartState] = useState<CartData>(emptyCart);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const setCart = useCallback((next: CartData) => {
    setCartState(next);
    setError(null);
  }, []);

  useEffect(() => {
    setWishlist(read<string[]>('safonix-wishlist', []));
    let cancelled = false;
    request('/api/cart').then(({ ok, data }) => {
      if (cancelled) return;
      if (ok) setCartState(data);
      setReady(true);
    });
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'safonix-wishlist') setWishlist(read<string[]>('safonix-wishlist', []));
    };
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  /** Sends one change to Medusa and shows the cart it answers with (or the problem). */
  const change = useCallback(async (url: string, method: string, body?: unknown): Promise<Result> => {
    setBusy(true);
    const { ok, data } = await request(url, method, body);
    setBusy(false);
    if (ok) {
      setCartState(data);
      setError(null);
      return { ok: true };
    }
    const message = data.message ?? 'Something went wrong. Please try again.';
    setError(message);
    return { ok: false, message };
  }, []);

  const add: Store['add'] = useCallback(
    async (item, qty = 1) => {
      const result = await change('/api/cart/items', 'POST', { variantId: item.variantId, qty, mrp: item.mrp ?? null, unit: item.unit ?? null });
      setDrawerOpen(true);
      return result;
    },
    [change],
  );
  const setQty: Store['setQty'] = useCallback(async (lineId, qty) => void (await change(`/api/cart/items/${lineId}`, 'PATCH', { qty })), [change]);
  const remove: Store['remove'] = useCallback(async (lineId) => void (await change(`/api/cart/items/${lineId}`, 'DELETE')), [change]);
  const clear = useCallback(async () => void (await change('/api/cart', 'DELETE')), [change]);
  const applyCoupon: Store['applyCoupon'] = useCallback((code) => change('/api/cart/promo', 'POST', { code }), [change]);
  const removeCoupon = useCallback(async () => {
    if (cart.coupon) await change('/api/cart/promo', 'DELETE', { code: cart.coupon });
  }, [change, cart.coupon]);

  const toggleWish = useCallback((slug: string) => {
    setWishlist((current) => {
      const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
      write('safonix-wishlist', next);
      return next;
    });
  }, []);
  const isWished = useCallback((slug: string) => wishlist.includes(slug), [wishlist]);

  // Before the address step Medusa has no delivery method yet, so the delivery charge shown is the same rule as an estimate.
  const totals = useMemo(() => {
    const after = cart.subtotal - cart.discount;
    const shipping = cart.shippingChosen ? cart.shipping : shippingFor(after);
    return { subtotal: cart.subtotal, discount: cart.discount, shipping, total: cart.shippingChosen ? cart.total : after + shipping };
  }, [cart]);

  const value: Store = {
    ready,
    busy,
    error,
    items: cart.items,
    count: cart.items.reduce((sum, line) => sum + line.qty, 0),
    ...totals,
    shippingChosen: cart.shippingChosen,
    coupon: cart.coupon,
    add,
    setQty,
    remove,
    clear,
    applyCoupon,
    removeCoupon,
    setCart,
    wishlist,
    toggleWish,
    isWished,
    drawerOpen,
    openDrawer: () => setDrawerOpen(true),
    closeDrawer: () => setDrawerOpen(false),
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
