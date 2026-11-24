'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAccount } from '@/lib/session';
import { BagIcon } from './CartDrawer';
import { useStore } from './StoreProvider';

const badge = 'absolute -right-1.5 -top-1.5 grid min-w-[1.15rem] place-items-center rounded-full bg-brand-500 px-1 text-[10px] font-bold leading-[1.15rem] text-white';
const iconBtn = 'relative grid size-10 place-items-center rounded-full text-navy-950 transition hover:bg-brand-50 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500';

/** Search, wishlist and cart icons for the header. */
export function HeaderActions({ compact = false }: { compact?: boolean }) {
  const { count, openDrawer, wishlist, ready } = useStore();
  const { signedIn } = useAccount();
  return (
    <div className="flex items-center gap-0.5">
      {!compact && <ExpandingSearch />}
      <Link href="/wishlist" className={iconBtn} aria-label={`Wishlist${ready && wishlist.length ? `, ${wishlist.length} items` : ''}`}>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 20.500s-7.500-4.500-7.500-10A4.500 4.500 0 0 1 12 7.600a4.500 4.500 0 0 1 7.500 2.900c0 5.500-7.500 10-7.500 10Z" />
        </svg>
        {ready && wishlist.length > 0 && <span className={badge}>{wishlist.length}</span>}
      </Link>
      <Link href={signedIn ? '/account' : '/login'} className={iconBtn} aria-label={signedIn ? 'My account' : 'Sign in'}>
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="8" r="3.600" />
          <path d="M5 20c0-3.600 3.100-6 7-6s7 2.400 7 6" />
        </svg>
        {signedIn && <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />}
      </Link>
      <button type="button" onClick={openDrawer} className={iconBtn} aria-label={`Open cart${ready && count ? `, ${count} items` : ''}`}>
        <BagIcon />
        {ready && count > 0 && <span className={badge}>{count}</span>}
      </button>
    </div>
  );
}

/**
 * Search icon that grows into a search field (to the left, over the menu) when clicked, and shrinks back on Escape,
 * on a click outside, or after searching. It never changes the layout around it.
 */
function ExpandingSearch() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    input.current?.focus();
    const onDown = (event: PointerEvent) => !wrap.current?.contains(event.target as Node) && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div ref={wrap} className="relative size-10">
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          const q = String(new FormData(event.currentTarget).get('q') ?? '').trim();
          setOpen(false);
          router.push(q ? `/products?q=${encodeURIComponent(q)}` : '/products');
        }}
        onKeyDown={(event) => event.key === 'Escape' && setOpen(false)}
        className={`absolute right-0 top-0 z-40 flex h-10 items-center overflow-hidden rounded-full border bg-white transition-[width,border-color,box-shadow] duration-300 ease-out dark:bg-[#1c080d] ${open ? 'w-[min(19rem,calc(100vw-9rem))] border-line shadow-[0_10px_28px_rgba(20,32,46,0.18)]' : 'w-10 border-transparent'}`}
      >
        <input
          ref={input}
          name="q"
          type="search"
          placeholder="Search products"
          aria-label="Search products"
          tabIndex={open ? 0 : -1}
          className={`h-full bg-transparent text-sm text-navy-950 outline-none transition-opacity duration-200 placeholder:text-muted [&::-webkit-search-cancel-button]:hidden ${open ? 'min-w-0 flex-1 pl-5 opacity-100 delay-100' : 'w-0 flex-none p-0 opacity-0'}`}
        />
        <button
          type="button"
          onClick={(event) => (open ? event.currentTarget.form?.requestSubmit() : setOpen(true))}
          aria-label={open ? 'Search' : 'Open search'}
          aria-expanded={open}
          className="grid size-10 shrink-0 place-items-center rounded-full text-navy-950 transition hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
        >
          <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
          </svg>
        </button>
      </form>
    </div>
  );
}
