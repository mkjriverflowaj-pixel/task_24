'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { OrderData } from '@/lib/cart-types';
import { money } from '@/lib/format';

/** The thank-you page after checkout: the order as Medusa holds it. */
export function OrderConfirmation() {
  const id = useSearchParams().get('id');
  const [order, setOrder] = useState<OrderData | null | undefined>(undefined);

  useEffect(() => {
    if (!id) return setOrder(null);
    let cancelled = false;
    fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: 'no-store' })
      .then(async (res) => (res.ok ? ((await res.json()) as { order: OrderData }).order : null))
      .catch(() => null)
      .then((found) => !cancelled && setOrder(found));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (order === undefined) return <div className="h-64 animate-pulse rounded-2xl bg-surface" aria-hidden="true" />;

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="text-xl font-bold text-navy-950">We could not find that order</p>
        <p className="mt-1 text-sm text-muted">Orders can only be opened right after they are placed, or when you are signed in to the account that placed them.</p>
        <Link href="/products" className="btn-primary mt-6">Continue shopping</Link>
      </div>
    );
  }

  const { customer } = order;
  return (
    <div>
      <div className="text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#e7f6ee] text-[#1a9b55]">
          <svg viewBox="0 0 24 24" className="size-8" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12.500 4.500 4.500L19 7.500" /></svg>
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950">Thank you, {customer.name.split(' ')[0]}!</h1>
        <p className="mt-2 text-muted">Your order <b className="text-navy-950">#{order.number}</b> has been placed. We will use {customer.email} for updates about it.</p>
      </div>

      <div className="mt-8 rounded-2xl border border-line bg-white p-5 sm:p-6">
        <ul className="divide-y divide-line">
          {order.items.map((line) => (
            <li key={line.id} className="flex items-center gap-3 py-3">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#f6f7fa] to-[#eceef3]">
                {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-contain p-1.5" />}
              </span>
              <span className="min-w-0 flex-1 text-sm"><span className="line-clamp-2 font-semibold text-navy-950">{line.name}</span><span className="text-muted">Qty {line.qty}</span></span>
              <span className="text-sm font-bold">{money(line.price * line.qty)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-3 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{money(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="flex justify-between"><dt className="text-muted">Coupon {order.coupon}</dt><dd className="text-[#1a9b55]">- {money(order.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd></div>
          <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{money(order.total)}</dd></div>
        </dl>
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 text-sm">
          <h2 className="font-bold text-navy-950">Delivering to</h2>
          <p className="mt-2 leading-relaxed text-muted">{customer.name}<br />{customer.address}<br />{customer.city}, {customer.state} {customer.pincode}<br />{customer.phone}</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5 text-sm">
          <h2 className="font-bold text-navy-950">Payment</h2>
          <p className="mt-2 text-muted">{order.payment}</p>
          <p className="mt-3 text-xs text-muted">Please keep {money(order.total)} ready when your order arrives.</p>
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link href="/products" className="btn-primary">Continue shopping</Link>
      </div>
    </div>
  );
}
