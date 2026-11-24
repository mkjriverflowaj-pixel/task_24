'use client';

import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { CountUp } from '@/components/CountUp';
import { Reveal } from '@/components/Reveal';
import type { OrderData } from '@/lib/cart-types';
import { money } from '@/lib/format';

/**
 * No real data is connected yet, so every number starts at zero and the activity list is empty. When the backend is
 * connected, fill POINTS, `stats` and `activity` from the signed-in user's account. The level names and the point targets
 * below are placeholders.
 */
const POINTS = 0;
const NEXT_TIER = { name: 'Silver', at: 1000 };
const stats: { label: string; value: number; note: string; icon: ReactNode }[] = [
  { label: 'Points balance', value: POINTS, note: 'Earned by scanning codes', icon: <path d="m12 4 2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8L12 4Z" /> },
  { label: 'Bonus earned', value: 0, note: 'Bonuses you unlock', icon: <path d="M4 11h16v9H4zM3 7.500h18V11H3zM12 7.500V20" /> },
  { label: 'Scans this month', value: 0, note: 'Codes you scan', icon: <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" /> },
  { label: 'Orders', value: 0, note: 'Placed on this website', icon: <path d="M5 7h14l-1.200 11a2 2 0 0 1-2 1.800H8.200a2 2 0 0 1-2-1.800L5 7ZM9 10V6.500a3 3 0 0 1 6 0V10" /> },
];

type Activity = { id: number; title: string; detail: string; points: number; kind: 'scan' | 'bonus' | 'redeem'; when: string };
const activity: Activity[] = [];

const kindStyle = {
  scan: { bg: 'bg-brand-50 text-brand-500', icon: <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" /> },
  bonus: { bg: 'bg-amber-50 text-amber-600', icon: <path d="M4 11h16v9H4zM3 7.500h18V11H3zM12 7.500V20" /> },
  redeem: { bg: 'bg-emerald-50 text-emerald-600', icon: <path d="M5 12h14M13 6l6 6-6 6" /> },
};

const actions = [
  { label: 'Scan a code', text: 'Open the Safonix Smart Link app', href: 'https://play.google.com/store/apps/details?id=com.safonix.app&hl=en_IN', external: true, icon: <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" /> },
  { label: 'Browse products', text: 'Switches, lighting, wires and more', href: '/products', icon: <path d="M12 3 4 7v10l8 4 8-4V7l-8-4ZM4 7l8 4 8-4M12 11v10" /> },
  { label: 'My wishlist', text: 'Products you saved', href: '/wishlist', icon: <path d="M12 20.500s-7.500-4.500-7.500-10A4.500 4.500 0 0 1 12 7.600a4.500 4.500 0 0 1 7.500 2.900c0 5.500-7.500 10-7.500 10Z" /> },
  { label: 'Edit profile', text: 'Update your details', href: '/profile', icon: <><circle cx="12" cy="8" r="3.500" /><path d="M5 20c0-3.600 3.100-6 7-6s7 2.400 7 6" /></> },
];

/** Plain words for where an order is, from Medusa's order, payment and fulfilment states. */
function orderStatus(order: OrderData) {
  if (order.status === 'canceled') return { text: 'Cancelled', tone: 'bg-navy-100 text-muted' };
  if (order.fulfillmentStatus === 'delivered') return { text: 'Delivered', tone: 'bg-emerald-50 text-emerald-600' };
  if (order.fulfillmentStatus === 'shipped' || order.fulfillmentStatus === 'partially_shipped') return { text: 'On the way', tone: 'bg-amber-50 text-amber-600' };
  return { text: 'Order placed', tone: 'bg-brand-50 text-brand-500' };
}

const svgProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

export function AccountOverview() {
  const [fill, setFill] = useState(0);
  const [orders, setOrders] = useState<OrderData[] | null>(null);
  const percent = Math.min(100, Math.round((POINTS / NEXT_TIER.at) * 100));

  useEffect(() => {
    const timer = setTimeout(() => setFill(percent), 400);
    return () => clearTimeout(timer);
  }, [percent]);

  // The shopper's real orders from Medusa
  useEffect(() => {
    fetch('/api/orders', { cache: 'no-store' })
      .then(async (res) => (res.ok ? ((await res.json()) as { orders: OrderData[] }).orders : []))
      .catch(() => [] as OrderData[])
      .then(setOrders);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 90} className="h-full">
            <div className="group h-full rounded-2xl border border-line bg-white p-5 shadow-[0_6px_20px_rgba(20,32,46,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/30 hover:shadow-[0_18px_36px_rgba(20,32,46,0.14)]">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-muted">{stat.label}</p>
                <span className="grid size-10 place-items-center rounded-xl bg-brand-50 text-brand-500 transition duration-300 group-hover:rotate-[-8deg] group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                  <svg {...svgProps} className="size-5">{stat.icon}</svg>
                </span>
              </div>
              <p className="mt-3 text-3xl font-extrabold tabular-nums text-navy-950">
                <CountUp value={stat.label === 'Orders' ? (orders?.length ?? 0) : stat.value} />
              </p>
              <p className="mt-0.5 text-xs text-muted">{stat.note}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#e04a4f] via-[#c8222c] to-[#7a0b17] p-6 text-white shadow-[0_18px_40px_rgba(122,11,23,0.3)] sm:p-7">
          <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-16 right-24 size-40 rounded-full border-[14px] border-white/10" aria-hidden="true" />
          <div className="relative flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">Your level</p>
              <h2 className="mt-1 text-2xl font-bold">New member</h2>
            </div>
            <p className="text-sm text-white/90">
              <strong className="text-lg tabular-nums">{(NEXT_TIER.at - POINTS).toLocaleString('en-IN')}</strong> more points to reach {NEXT_TIER.name}
            </p>
          </div>
          <div className="relative mt-5" role="progressbar" aria-valuemin={0} aria-valuemax={NEXT_TIER.at} aria-valuenow={POINTS} aria-label={`Progress to ${NEXT_TIER.name}`}>
            <div className="h-3 overflow-hidden rounded-full bg-white/25">
              <div className="relative h-full rounded-full bg-white transition-[width] duration-[1400ms] ease-out" style={{ width: `${fill}%` }}>
                <span className="absolute inset-y-0 right-0 w-10 animate-pulse rounded-full bg-gradient-to-r from-transparent to-[#ffd9dc]" aria-hidden="true" />
              </div>
            </div>
            <div className="mt-2 flex justify-between text-xs font-semibold text-white/80">
              <span>{POINTS.toLocaleString('en-IN')} pts</span>
              <span>{NEXT_TIER.at.toLocaleString('en-IN')} pts</span>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <section aria-label="Your orders" className="rounded-2xl border border-line bg-white p-5 shadow-[0_6px_20px_rgba(20,32,46,0.06)] sm:p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-950">Your orders</h2>
            <span className="h-0.5 w-10 bg-brand-500" aria-hidden="true" />
          </div>
          {orders === null ? (
            <div className="mt-4 h-20 animate-pulse rounded-xl bg-surface" aria-hidden="true" />
          ) : orders.length === 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-dashed border-line bg-surface px-5 py-6">
              <p className="text-sm text-muted">You have not placed an order yet.</p>
              <Link href="/products" className="text-sm font-semibold text-brand-500 hover:underline">Browse products →</Link>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {orders.map((order) => {
                const status = orderStatus(order);
                const count = order.items.reduce((sum, line) => sum + line.qty, 0);
                return (
                  <li key={order.id}>
                    <Link href={`/order-confirmation?id=${encodeURIComponent(order.id)}`} className="group flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 transition hover:text-brand-500">
                      <span className="w-16 text-[15px] font-bold text-navy-950 transition-colors group-hover:text-brand-500">#{order.number}</span>
                      <span className="min-w-0 flex-1 text-sm text-muted">
                        {new Date(order.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {count} {count === 1 ? 'item' : 'items'}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${status.tone}`}>{status.text}</span>
                      <span className="w-24 text-right text-sm font-bold tabular-nums text-navy-950">{money(order.total)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Reveal>
          <div className="h-full rounded-2xl border border-line bg-white p-5 shadow-[0_6px_20px_rgba(20,32,46,0.06)] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-950">Recent activity</h2>
              <span className="h-0.5 w-10 bg-brand-500" aria-hidden="true" />
            </div>
            {activity.length === 0 ? (
              <div className="mt-6 flex flex-col items-center py-8 text-center">
                <span className="grid size-16 place-items-center rounded-2xl bg-brand-50 text-brand-500">
                  <svg {...svgProps} className="size-8">
                    <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" />
                  </svg>
                </span>
                <p className="mt-4 text-[15px] font-bold text-navy-950">No activity yet</p>
                <p className="mt-1 max-w-xs text-sm text-muted">Your scans, bonuses and redeemed rewards will show up here.</p>
              </div>
            ) : (
            <ul className="mt-4 divide-y divide-line">
              {activity.map((item) => {
                const style = kindStyle[item.kind];
                return (
                  <li key={item.id} className="group flex items-center gap-4 py-3.5 transition duration-200 hover:translate-x-1">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl transition duration-300 group-hover:scale-110 ${style.bg}`}>
                      <svg {...svgProps} className="size-5">{style.icon}</svg>
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-navy-950">{item.title}</p>
                      <p className="text-xs text-muted">{item.detail} · {item.when}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-bold tabular-nums ${item.points > 0 ? 'text-emerald-600' : 'text-brand-500'}`}>
                      {item.points > 0 ? '+' : ''}{item.points} pts
                    </span>
                  </li>
                );
              })}
            </ul>
            )}
          </div>
        </Reveal>

        <Reveal delay={120}>
          <div className="h-full rounded-2xl border border-line bg-white p-5 shadow-[0_6px_20px_rgba(20,32,46,0.06)] sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-navy-950">Quick actions</h2>
              <span className="h-0.5 w-10 bg-brand-500" aria-hidden="true" />
            </div>
            <ul className="mt-4 space-y-3">
              {actions.map((action) => {
                const inner = (
                  <>
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-500 transition duration-300 group-hover:rotate-[-8deg] group-hover:bg-brand-500 group-hover:text-white">
                      <svg {...svgProps} className="size-5">{action.icon}</svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold text-navy-950 transition-colors group-hover:text-brand-500">{action.label}</span>
                      <span className="block truncate text-xs text-muted">{action.text}</span>
                    </span>
                    <svg {...svgProps} strokeWidth={2.2} className="size-4 -translate-x-2 text-brand-500 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </>
                );
                const cls = 'group flex items-center gap-3 rounded-xl border border-line p-3 transition duration-200 hover:-translate-y-0.5 hover:border-brand-500/40 hover:shadow-[0_10px_22px_rgba(20,32,46,0.1)] active:scale-[0.99]';
                return (
                  <li key={action.label}>
                    {action.external ? (
                      <a href={action.href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
                    ) : (
                      <Link href={action.href} className={cls}>{inner}</Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
