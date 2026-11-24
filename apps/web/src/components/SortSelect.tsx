'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

const options = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer rating' },
  { value: 'discount', label: 'Biggest discount' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

/** "Sort by" drop-down: keeps the current filters and goes back to page one. */
export function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      Sort by:
      <select
        value={value}
        onChange={(event) => {
          const next = new URLSearchParams(params.toString());
          next.set('sort', event.target.value);
          next.delete('page');
          router.push(`${pathname}?${next.toString()}`, { scroll: false });
        }}
        className="cursor-pointer rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy-950 outline-none transition hover:border-brand-500/60 focus-visible:border-brand-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
