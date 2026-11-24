'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const PRICES: { label: string; min?: string; max?: string }[] = [
  { label: 'Any price' },
  { label: 'Under ₹500', max: '500' },
  { label: '₹500 – ₹2,000', min: '500', max: '2000' },
  { label: '₹2,000 – ₹5,000', min: '2000', max: '5000' },
  { label: 'Above ₹5,000', min: '5000' },
];
const RATINGS = [
  { label: 'Any rating' },
  { label: '4★ & up', value: '4' },
  { label: '3★ & up', value: '3' },
];

/**
 * "Filters" button with a pick-only panel (no typing): price range, availability, rating and offers.
 * Every click is applied straight away, keeps the other filters and goes back to page one.
 */
export function FilterMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const min = params.get('min') ?? undefined;
  const max = params.get('max') ?? undefined;
  const stock = params.get('stock') === '1';
  const sale = params.get('sale') === '1';
  const rating = params.get('rating') ?? undefined;
  const count = (min || max ? 1 : 0) + (stock ? 1 : 0) + (sale ? 1 : 0) + (rating ? 1 : 0);

  const apply = (changes: Record<string, string | undefined>) => {
    const next = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) next.set(key, value);
      else next.delete(key);
    }
    next.delete('page');
    const text = next.toString();
    router.push(text ? `${pathname}?${text}` : pathname, { scroll: false });
  };
  const clear = () => apply({ min: undefined, max: undefined, stock: undefined, sale: undefined, rating: undefined });

  const option = (selected: boolean) =>
    `rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-line bg-surface text-navy-950 hover:border-brand-500'}`;

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-semibold transition hover:border-brand-500 ${open || count ? 'border-brand-500 text-brand-500' : 'border-line text-navy-950'}`}
      >
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
        Filters
        {count > 0 && <span className="grid size-5 place-items-center rounded-full bg-brand-500 text-[11px] font-bold text-white">{count}</span>}
      </button>

      {open && (
        <div role="dialog" aria-label="Filters" className="absolute right-0 top-full z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-line bg-white p-5 shadow-[0_18px_44px_rgba(20,32,46,0.22)] dark:bg-[#1c080d]">
          <fieldset>
            <legend className="text-xs font-extrabold uppercase tracking-[0.16em] text-navy-950">Price</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {PRICES.map((price) => (
                <button key={price.label} type="button" aria-pressed={min === price.min && max === price.max} onClick={() => apply({ min: price.min, max: price.max })} className={option(min === price.min && max === price.max)}>
                  {price.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-xs font-extrabold uppercase tracking-[0.16em] text-navy-950">Availability</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" aria-pressed={!stock} onClick={() => apply({ stock: undefined })} className={option(!stock)}>All</button>
              <button type="button" aria-pressed={stock} onClick={() => apply({ stock: '1' })} className={option(stock)}>In stock only</button>
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-xs font-extrabold uppercase tracking-[0.16em] text-navy-950">Rating</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              {RATINGS.map((item) => (
                <button key={item.label} type="button" aria-pressed={rating === item.value} onClick={() => apply({ rating: item.value })} className={option(rating === item.value)}>
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="text-xs font-extrabold uppercase tracking-[0.16em] text-navy-950">Offers</legend>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" aria-pressed={!sale} onClick={() => apply({ sale: undefined })} className={option(!sale)}>All</button>
              <button type="button" aria-pressed={sale} onClick={() => apply({ sale: '1' })} className={option(sale)}>On sale</button>
            </div>
          </fieldset>

          <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
            <button type="button" onClick={clear} disabled={count === 0} className="font-semibold text-brand-500 hover:underline disabled:cursor-default disabled:text-muted disabled:no-underline">
              Clear filters
            </button>
            <button type="button" onClick={() => setOpen(false)} className="btn-primary !px-5 !py-2">Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
