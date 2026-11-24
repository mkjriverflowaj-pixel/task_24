'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BagIcon, QtyStepper } from './CartDrawer';
import { useStore, type Buyable } from './StoreProvider';

export type { Buyable };

const LOW_STOCK = 5;

/** Small "Add to cart" button for product cards. */
export function AddToCartButton({ product }: { product: Buyable }) {
  const { add, busy } = useStore();
  const [done, setDone] = useState(false);
  const [failed, setFailed] = useState(false);
  const out = product.stock != null && product.stock <= 0;

  return (
    <button
      type="button"
      disabled={out || busy}
      onClick={async () => {
        const result = await add(product, 1);
        if (result.ok) setDone(true);
        else setFailed(true);
        window.setTimeout(() => {
          setDone(false);
          setFailed(false);
        }, 1800);
      }}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
        out ? 'cursor-not-allowed bg-navy-100 text-muted' : failed ? 'bg-navy-950 text-white' : done ? 'bg-[#1a9b55] text-white' : 'bg-brand-500 text-white hover:bg-brand-400 active:scale-[0.98]'
      }`}
    >
      {out ? (
        'Out of stock'
      ) : failed ? (
        'Not enough in stock'
      ) : done ? (
        <>
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.500 4.500 4.500L19 7.500" /></svg>
          Added
        </>
      ) : (
        <>
          <BagIcon className="size-4" />
          Add to cart
        </>
      )}
    </button>
  );
}

/** Heart that adds or removes a product from the wishlist. */
export function WishlistButton({ slug, className = '' }: { slug: string; className?: string }) {
  const { toggleWish, isWished, ready } = useStore();
  const on = ready && isWished(slug);
  return (
    <button
      type="button"
      onClick={() => toggleWish(slug)}
      aria-pressed={on}
      aria-label={on ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`grid size-9 place-items-center rounded-full border border-line bg-white/90 text-navy-950 shadow-sm backdrop-blur transition hover:scale-110 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500 dark:bg-[#1c080d]/90 ${className}`}
    >
      <svg viewBox="0 0 24 24" className={`size-[18px] transition ${on ? 'text-brand-500' : ''}`} fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 20.500s-7.500-4.500-7.500-10A4.500 4.500 0 0 1 12 7.600a4.500 4.500 0 0 1 7.500 2.900c0 5.500-7.500 10-7.500 10Z" />
      </svg>
    </button>
  );
}

/** Quantity, Add to cart and Buy now for the product page. */
export function BuyBox({ product }: { product: Buyable }) {
  const { add, items, busy, error } = useStore();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const stock = product.stock;
  const out = stock != null && stock <= 0;
  const max = stock != null ? Math.max(1, Math.min(20, stock)) : 20;
  const inCart = items.find((line) => line.slug === product.slug)?.qty ?? 0;

  return (
    <div className="mt-6">
      {/* Stock is shown in "At a glance"; only the urgent cases are repeated here. */}
      {(out || (stock != null && stock <= LOW_STOCK)) && (
        <p className={`text-sm font-semibold ${out ? 'text-brand-500' : 'text-[#d97706]'}`}>
          {out ? 'Currently out of stock' : `Only ${stock} left in stock, order soon`}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!out && (
          <>
            <QtyStepper qty={qty} onChange={(value) => setQty(Math.max(1, value))} max={max} size="md" />
            <button type="button" disabled={busy} onClick={() => void add(product, qty)} className="btn-primary !px-7 disabled:opacity-70">
              <BagIcon className="size-4" />
              Add to cart
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                const result = await add(product, qty);
                if (result.ok) router.push('/checkout');
              }}
              className="inline-flex items-center justify-center rounded-full bg-navy-950 px-7 py-3 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-70"
            >
              Buy now
            </button>
          </>
        )}
        <WishlistButton slug={product.slug} className="!size-11" />
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-semibold text-brand-500">{error}</p>}
      {inCart > 0 && (
        <p className="mt-3 text-sm text-muted">
          {inCart} in your cart ·{' '}
          <Link href="/cart" className="font-semibold text-brand-500 hover:underline">View cart</Link>
        </p>
      )}
    </div>
  );
}
