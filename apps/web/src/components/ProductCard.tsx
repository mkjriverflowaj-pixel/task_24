import Image from 'next/image';
import Link from 'next/link';
import { discountPercent } from '@/lib/format';
import { mediaUrl, type Product } from '@/lib/strapi';
import { AddToCartButton, WishlistButton } from './store/AddToCart';
import { Price } from './store/Price';
import { Stars } from './store/Stars';

/** Store card: picture with badges and a wishlist heart, name, rating, price, and an Add to cart button. */
export function ProductCard({ product }: { product: Product }) {
  const image = mediaUrl(product.images?.[0]);
  const off = discountPercent(product.price, product.compareAtPrice);
  const out = product.stock != null && product.stock <= 0;
  const href = `/product/${product.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[0_4px_16px_rgba(20,32,46,0.05)] transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-[0_18px_36px_rgba(20,32,46,0.14)]">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#f6f7fa] to-[#eceef3]" aria-label={product.name}>
        <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
          {off > 0 && <span className="rounded bg-[#1a9b55] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{off}% off</span>}
          {product.badge && <span className="rounded bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{product.badge}</span>}
        </div>
        {image ? (
          <Image
            src={image}
            alt={product.images?.[0]?.alternativeText ?? product.name}
            fill
            sizes="(min-width: 1280px) 22vw, (min-width: 640px) 40vw, 90vw"
            className={`object-contain p-6 transition duration-500 group-hover:scale-105 ${out ? 'opacity-50 grayscale' : ''}`}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-navy-900/20">
            <svg viewBox="0 0 24 24" className="size-14" fill="currentColor" aria-hidden="true">
              <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
            </svg>
          </div>
        )}
        {out && <span className="absolute inset-x-0 bottom-3 mx-auto w-fit rounded-full bg-navy-950/85 px-3 py-1 text-xs font-semibold text-white">Out of stock</span>}
      </Link>
      <WishlistButton slug={product.slug} className="absolute right-3 top-3 z-10" />

      <div className="flex flex-1 flex-col p-4">
        {product.category && <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">{product.category.name}</p>}
        <h3 className="mt-1 font-bold leading-snug text-navy-950 transition-colors duration-300 group-hover:text-brand-500">
          <Link href={href}>{product.name}</Link>
        </h3>
        <div className="mt-1.5 min-h-[1.1rem]">
          <Stars rating={product.rating} count={product.reviewCount} />
        </div>
        {product.shortDescription && <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-muted">{product.shortDescription}</p>}
        <div className="mt-auto pt-4">
          <Price price={product.price} compareAt={product.compareAtPrice} unit={product.unit} className="mb-3" />
          {product.price != null && product.variantId ? (
            <AddToCartButton
              product={{
                variantId: product.variantId,
                slug: product.slug,
                name: product.name,
                price: product.price,
                mrp: product.compareAtPrice,
                image,
                unit: product.unit,
                stock: product.stock,
              }}
            />
          ) : (
            <Link href={href} className="inline-flex w-full items-center justify-center rounded-full bg-navy-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-brand-500">View details</Link>
          )}
        </div>
      </div>
    </article>
  );
}
