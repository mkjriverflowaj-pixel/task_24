'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { useStore } from './StoreProvider';

/** Shows the product cards (rendered on the server) whose slug is in the visitor's wishlist. */
export function WishlistGrid({ cards }: { cards: { slug: string; card: ReactNode }[] }) {
  const { ready, wishlist } = useStore();
  if (!ready) return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-surface" aria-hidden="true" />;
  const saved = cards.filter((item) => wishlist.includes(item.slug));

  if (saved.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="text-xl font-bold text-navy-950">Nothing saved yet</p>
        <p className="mt-1 text-sm text-muted">Tap the heart on any product to keep it here.</p>
        <Link href="/products" className="btn-primary mt-6">Browse products</Link>
      </div>
    );
  }

  return (
    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {saved.map((item) => (
        <li key={item.slug} className="h-full [&>*]:h-full">{item.card}</li>
      ))}
    </ul>
  );
}
