import { FREE_SHIPPING_FROM, formatPrice } from '@/lib/format';

const ASSURANCES = [
  ['Free delivery', `Above ${formatPrice(FREE_SHIPPING_FROM)}`, 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3ZM17 19.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3Z'],
  ['7-day returns', 'On unused items', 'M4 12a8 8 0 1 0 3-6.200M4 4v4h4'],
  ['Genuine product', 'Safonix warranty', 'M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6zM9 12l2 2 4-4'],
] as const;

/** The three store promises shown under the buy buttons on the product page. */
export function StoreAssurances() {
  return (
    <ul className="grid grid-cols-3 gap-2 rounded-2xl border border-line bg-white p-4 sm:p-5">
      {ASSURANCES.map(([title, text, path]) => (
        <li key={title} className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:text-left">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
            <svg viewBox="0 0 24 24" className="size-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
          </span>
          <span className="text-xs leading-tight"><b className="block text-navy-950">{title}</b><span className="text-muted">{text}</span></span>
        </li>
      ))}
    </ul>
  );
}
