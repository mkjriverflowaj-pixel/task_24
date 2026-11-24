import Link from 'next/link';
import type { Product } from '@/lib/strapi';
import { ProductCard } from '../ProductCard';
import { Reveal } from '../Reveal';
import { SectionHeading } from '../SectionHeading';

/** A row of product cards with a heading and a "View all" link, for the home page. */
export function ProductShelf({ eyebrow, title, subtitle, products, href = '/products', tint = false }: { eyebrow?: string; title: string; subtitle?: string; products: Product[]; href?: string; tint?: boolean }) {
  if (products.length === 0) return null;
  return (
    <section className={`py-10 ${tint ? 'bg-[#fff6f7]' : ''}`}>
      <div className="container-page">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <Reveal variant="3d-flip">
            <SectionHeading eyebrow={eyebrow} title={title} subtitle={subtitle} />
          </Reveal>
          <Link href={href} className="text-sm font-bold text-brand-500 hover:underline">View all →</Link>
        </div>
        <ul className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, index) => (
            <Reveal as="li" key={product.documentId} delay={index * 70} className="h-full [&>*]:h-full">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

const items = [
  ['Free delivery', 'On orders above ₹999', 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3ZM17 19.500a1.500 1.500 0 1 0 0-3 1.500 1.500 0 0 0 0 3Z'],
  ['7-day returns', 'Easy returns on unused items', 'M4 12a8 8 0 1 0 3-6.200M4 4v4h4'],
  ['Genuine products', 'Made and tested by Safonix', 'M12 3l7 3v5c0 4.500-3 8-7 10-4-2-7-5.500-7-10V6zM9 12l2 2 4-4'],
  ['Secure checkout', 'Cash, UPI and card options', 'M6 11V8a6 6 0 0 1 12 0v3M5 11h14v9H5z'],
];

/** Strip of store promises shown under the home banner. */
export function TrustStrip() {
  return (
    <section className="border-b border-line bg-white py-5">
      <ul className="container-page grid grid-cols-2 gap-4 lg:grid-cols-4">
        {items.map(([title, text, path]) => (
          <li key={title} className="flex items-center gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>
            </span>
            <span className="text-sm leading-tight"><b className="block text-navy-950">{title}</b><span className="text-xs text-muted">{text}</span></span>
          </li>
        ))}
      </ul>
    </section>
  );
}
