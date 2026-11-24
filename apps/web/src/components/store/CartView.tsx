'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FREE_SHIPPING_FROM, formatPrice, money } from '@/lib/format';
import { QtyStepper } from './CartDrawer';
import { useStore } from './StoreProvider';

/** Order summary used on the cart and checkout pages. */
export function Summary({ children }: { children?: React.ReactNode }) {
  const { subtotal, discount, shipping, shippingChosen, total, coupon } = useStore();
  const row = 'flex items-center justify-between text-sm';
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-[0_4px_16px_rgba(20,32,46,0.05)]">
      <h2 className="text-lg font-bold text-navy-950">Order summary</h2>
      <dl className="mt-4 space-y-2.5">
        <div className={row}><dt className="text-muted">Subtotal</dt><dd className="font-semibold">{money(subtotal)}</dd></div>
        {discount > 0 && (
          <div className={row}><dt className="text-muted">Coupon {coupon}</dt><dd className="font-semibold text-[#1a9b55]">- {money(discount)}</dd></div>
        )}
        <div className={row}><dt className="text-muted">Delivery</dt><dd className="font-semibold">{shipping === 0 ? <span className="text-[#1a9b55]">Free</span> : money(shipping)}</dd></div>
        <div className="flex items-center justify-between border-t border-line pt-3 text-base font-bold"><dt>Total</dt><dd>{money(total)}</dd></div>
      </dl>
      <p className="mt-1 text-xs text-muted">
        Inclusive of all taxes. Free delivery on orders above {formatPrice(FREE_SHIPPING_FROM)}.{!shippingChosen && ' The delivery charge is confirmed at checkout.'}
      </p>
      {children}
    </div>
  );
}

export function CartView() {
  const { ready, busy, error, items, setQty, remove, clear, coupon, applyCoupon, removeCoupon } = useStore();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  if (!ready) return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-surface" aria-hidden="true" />;

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="text-xl font-bold text-navy-950">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted">Add a few products and they will show up here.</p>
        <Link href="/products" className="btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_22rem]">
      <div>
        {error && <p role="alert" className="mb-3 rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-500">{error}</p>}
        <ul className={`divide-y divide-line rounded-2xl border border-line bg-white px-5 transition-opacity ${busy ? 'opacity-60' : ''}`}>
          {items.map((line) => (
            <li key={line.id} className="flex gap-4 py-5">
              <Link href={`/product/${line.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#f6f7fa] to-[#eceef3]">
                {line.image && <Image src={line.image} alt={line.name} fill sizes="96px" className="object-contain p-2" />}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/product/${line.slug}`} className="font-semibold leading-snug text-navy-950 transition hover:text-brand-500">{line.name}</Link>
                  <p className="shrink-0 font-bold text-navy-950">{money(line.price * line.qty)}</p>
                </div>
                <p className="mt-0.5 text-sm text-muted">{money(line.price)}{line.unit ? ` / ${line.unit}` : ''}</p>
                <div className="mt-3 flex items-center justify-between">
                  <QtyStepper qty={line.qty} onChange={(q) => void setQty(line.id, q)} max={20} />
                  <button type="button" onClick={() => void remove(line.id)} className="text-sm font-semibold text-muted underline-offset-2 transition hover:text-brand-500 hover:underline">Remove</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <Link href="/products" className="text-sm font-semibold text-brand-500 hover:underline">← Continue shopping</Link>
          <button type="button" onClick={() => void clear()} className="text-sm font-semibold text-muted hover:text-brand-500">Clear cart</button>
        </div>
      </div>

      <div className="space-y-4 lg:sticky lg:top-28">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-navy-950">Have a coupon?</h2>
          {coupon ? (
            <p className="mt-3 flex items-center justify-between rounded-lg bg-[#e7f6ee] px-3 py-2 text-sm font-semibold text-[#14804a]">
              {coupon} applied
              <button type="button" onClick={() => { void removeCoupon(); setMessage(null); }} className="text-xs underline">Remove</button>
            </p>
          ) : (
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                const result = await applyCoupon(code);
                setMessage({ ok: result.ok, text: result.ok ? 'Coupon applied.' : result.message });
                if (result.ok) setCode('');
              }}
              className="mt-3 flex gap-2"
            >
              <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Enter code" aria-label="Coupon code" className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface px-4 text-sm uppercase text-navy-950 outline-none placeholder:normal-case focus:border-brand-500" />
              <button type="submit" disabled={busy} className="rounded-full bg-navy-950 px-5 text-sm font-bold text-white transition hover:bg-brand-500 disabled:opacity-70">Apply</button>
            </form>
          )}
          {message && !coupon && <p className={`mt-2 text-xs ${message.ok ? 'text-[#14804a]' : 'text-brand-500'}`}>{message.text}</p>}
          <p className="mt-2 text-xs text-muted">Try SAFONIX10 for 10% off or WELCOME5 for 5% off.</p>
        </div>
        <Summary>
          <Link href="/checkout" className="btn-primary mt-5 w-full">Proceed to checkout</Link>
        </Summary>
      </div>
    </div>
  );
}
