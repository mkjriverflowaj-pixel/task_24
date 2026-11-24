'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { money } from '@/lib/format';
import { useStore } from './StoreProvider';

/** Slide-in mini cart: opens when something is added, and from the bag icon in the header. */
export function CartDrawer() {
  const { drawerOpen, closeDrawer, items, count, subtotal, setQty, remove, busy, error } = useStore();
  const pathname = usePathname();
  const panel = useRef<HTMLElement>(null);

  useEffect(() => closeDrawer(), [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && closeDrawer();
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [drawerOpen, closeDrawer]);

  return (
    <div className={`fixed inset-0 z-[120] ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
      <div className={`absolute inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 ${drawerOpen ? 'opacity-100' : 'opacity-0'}`} onClick={closeDrawer} />
      <aside
        ref={panel}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white text-navy-950 shadow-2xl outline-none transition-transform duration-300 ease-out dark:bg-[#1c080d] ${drawerOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-bold">
            Your cart <span className="text-sm font-medium text-muted">({count} {count === 1 ? 'item' : 'items'})</span>
          </h2>
          <button type="button" onClick={closeDrawer} aria-label="Close cart" className="grid size-9 place-items-center rounded-full border border-line transition hover:border-brand-500 hover:text-brand-500">
            <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <span className="grid size-16 place-items-center rounded-full bg-brand-50 text-brand-500">
              <BagIcon className="size-7" />
            </span>
            <p className="text-lg font-bold">Your cart is empty</p>
            <p className="text-sm text-muted">Browse our switches, lighting, wires and more, and add what you need.</p>
            <Link href="/products" className="btn-primary mt-2" onClick={closeDrawer}>Start shopping</Link>
          </div>
        ) : (
          <>
            {error && <p role="alert" className="mx-5 mt-3 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-500">{error}</p>}
            <ul className={`flex-1 divide-y divide-line overflow-y-auto px-5 transition-opacity ${busy ? 'opacity-60' : ''}`}>
              {items.map((line) => (
                <li key={line.id} className="flex gap-3 py-4">
                  <Link href={`/product/${line.slug}`} onClick={closeDrawer} className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#f6f7fa] to-[#eceef3]">
                    {line.image && <Image src={line.image} alt={line.name} fill sizes="80px" className="object-contain p-2" />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={`/product/${line.slug}`} onClick={closeDrawer} className="line-clamp-2 text-sm font-semibold leading-snug transition hover:text-brand-500">{line.name}</Link>
                    <p className="mt-0.5 text-sm font-bold">{money(line.price)}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <QtyStepper qty={line.qty} onChange={(q) => void setQty(line.id, q)} max={20} />
                      <button type="button" onClick={() => void remove(line.id)} className="text-xs font-semibold text-muted underline-offset-2 transition hover:text-brand-500 hover:underline">Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between text-base font-bold">
                <span>Subtotal</span>
                <span>{money(subtotal)}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">Taxes included. Delivery and coupons are applied at checkout.</p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Link href="/cart" onClick={closeDrawer} className="inline-flex items-center justify-center rounded-full border-[1.5px] border-navy-950 px-5 py-3 text-sm font-bold text-navy-950 transition hover:bg-navy-950 hover:text-white">View cart</Link>
                <Link href="/checkout" onClick={closeDrawer} className="btn-primary">Checkout</Link>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}

export function QtyStepper({ qty, onChange, max = 20, size = 'sm' }: { qty: number; onChange: (qty: number) => void; max?: number; size?: 'sm' | 'md' }) {
  const box = size === 'md' ? 'h-11 min-w-11 text-lg' : 'h-8 min-w-8 text-base';
  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-line">
      <button type="button" aria-label="Decrease quantity" onClick={() => onChange(qty - 1)} className={`${box} grid place-items-center font-bold transition hover:bg-brand-50 hover:text-brand-500`}>−</button>
      <span className={`${size === 'md' ? 'min-w-10 text-base' : 'min-w-7 text-sm'} text-center font-semibold tabular-nums`} aria-live="polite">{qty}</span>
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(Math.min(max, qty + 1))} disabled={qty >= max} className={`${box} grid place-items-center font-bold transition hover:bg-brand-50 hover:text-brand-500 disabled:cursor-not-allowed disabled:opacity-40`}>+</button>
    </div>
  );
}

export function BagIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="20.5" r="1.3" />
      <circle cx="18" cy="20.5" r="1.3" />
      <path d="M2 3h3l2.6 12.2a1.8 1.8 0 0 0 1.8 1.4h8.4a1.8 1.8 0 0 0 1.7-1.3L21.5 7H6" />
    </svg>
  );
}
