import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { ScrollProgress } from '@/components/ScrollProgress';
import { FilterMenu } from '@/components/FilterMenu';
import { SortSelect } from '@/components/SortSelect';
import { discountPercent, formatPrice } from '@/lib/format';
import { getAllProducts, getProductsPage, getTopCategories, mediaUrl, type Category, type Product } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse Safonix modular switches, LED lighting, wires and cables, MCBs and DBs, fans and accessories.',
};

const PAGE_SIZE = 9;
type Query = { category?: string; sub?: string; sort?: string; page?: string; q?: string; min?: string; max?: string; stock?: string; rating?: string; sale?: string };
const SORTS = ['featured', 'price-asc', 'price-desc', 'rating', 'discount', 'name-asc', 'name-desc'];
type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

/** Builds a /products link that keeps only the filters given. */
function link(query: Query) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value) params.set(key, value);
  const text = params.toString();
  return text ? `/products?${text}` : '/products';
}

const Chevron = ({ open }: { open: boolean }) => (
  <svg viewBox="0 0 24 24" className={`size-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m9 6 6 6-6 6" />
  </svg>
);

function Sidebar({
  categories,
  products,
  category,
  sub,
  filtered,
  keep,
}: {
  keep: Query;
  categories: Category[];
  products: Product[];
  category?: string;
  sub?: string;
  filtered: boolean;
}) {
  const withKeep = (query: Query) => link({ ...keep, ...query });
  const inTop = (product: Product, slug: string) => product.category?.slug === slug || product.category?.parent?.slug === slug;

  return (
    <aside className="lg:sticky lg:top-28 lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden">
      <nav aria-label="Product categories" className="pr-2">
        <h2 className="flex items-center justify-between text-xs font-extrabold uppercase tracking-[0.18em] text-navy-950">
          Categories
          <span className="h-0.5 w-8 bg-brand-500" aria-hidden="true" />
        </h2>
        <ul className="mt-4 space-y-1">
          <li>
            <Link
              href={withKeep({})}
              aria-current={!category ? 'page' : undefined}
              className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition ${!category ? 'bg-brand-50 text-brand-500' : 'text-navy-950 hover:bg-surface hover:text-brand-500'}`}
            >
              All Products
              <span className="text-xs font-medium text-muted">{products.length}</span>
            </Link>
          </li>
          {categories.map((item) => {
            const open = category === item.slug;
            const count = products.filter((product) => inTop(product, item.slug)).length;
            const children = [...(item.children ?? [])].sort((a, b) => a.order - b.order);
            return (
              <li key={item.documentId}>
                <Link
                  href={open ? withKeep({}) : withKeep({ category: item.slug })}
                  aria-expanded={children.length > 0 ? open : undefined}
                  className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${open ? 'bg-brand-50 text-brand-500' : 'text-navy-950 hover:bg-surface hover:text-brand-500'}`}
                >
                  <span className="flex items-center gap-2">
                    {children.length > 0 && <Chevron open={open} />}
                    {item.name}
                  </span>
                  <span className="text-xs font-medium text-muted">{count}</span>
                </Link>
                {open && children.length > 0 && (
                  <ul className="ml-5 mt-1 space-y-0.5 border-l-2 border-brand-500/30 pl-3">
                    {children.map((child) => {
                      const selected = sub === child.slug;
                      const childCount = products.filter((product) => product.category?.slug === child.slug).length;
                      return (
                        <li key={child.documentId}>
                          <Link
                            href={selected ? withKeep({ category: item.slug }) : withKeep({ category: item.slug, sub: child.slug })}
                            aria-current={selected ? 'page' : undefined}
                            className={`flex items-center justify-between gap-2 rounded-md px-2.5 py-2 text-[13px] transition ${selected ? 'bg-brand-500 font-semibold text-white' : 'text-navy-900 hover:bg-surface hover:text-brand-500'}`}
                          >
                            {child.name}
                            <span className={`text-xs ${selected ? 'text-white/80' : 'text-muted'}`}>{childCount}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-4 text-xs">
          <span className="text-muted">{categories.length} Categories</span>
          {filtered && (
            <Link href="/products" className="font-semibold text-brand-500 hover:underline">
              Reset Filter
            </Link>
          )}
        </div>
      </nav>

    </aside>
  );
}

function Pagination({ page, pages, query }: { page: number; pages: number; query: Query }) {
  if (pages < 2) return null;
  const numbers = Array.from({ length: pages }, (_, index) => index + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  const item = 'grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-semibold transition';
  const go = (n: number) => link({ ...query, page: n > 1 ? String(n) : undefined });

  return (
    <nav aria-label="Pagination" className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
      {page > 1 ? (
        <Link href={go(page - 1)} className={`${item} border-line text-navy-950 hover:border-brand-500 hover:text-brand-500`}>Previous</Link>
      ) : (
        <span className={`${item} border-line text-muted/60`}>Previous</span>
      )}
      <ul className="flex flex-wrap items-center gap-1.5">
        {numbers.map((n, index) => (
          <li key={n} className="flex items-center gap-1.5">
            {index > 0 && n - numbers[index - 1] > 1 && <span className="px-1 text-muted">…</span>}
            <Link
              href={go(n)}
              aria-current={n === page ? 'page' : undefined}
              className={`${item} ${n === page ? 'border-brand-500 bg-brand-500 text-white' : 'border-transparent text-navy-950 hover:border-line hover:text-brand-500'}`}
            >
              {n}
            </Link>
          </li>
        ))}
      </ul>
      {page < pages ? (
        <Link href={go(page + 1)} className={`${item} border-line text-navy-950 hover:border-brand-500 hover:text-brand-500`}>Next</Link>
      ) : (
        <span className={`${item} border-line text-muted/60`}>Next</span>
      )}
    </nav>
  );
}

export default async function ProductsPage({ searchParams }: Props) {
  const raw = await searchParams;
  const [page, allCategories, products] = await Promise.all([getProductsPage(), getTopCategories(), getAllProducts()]);
  // Categories switched off with "Show on products page" in Strapi are left out.
  const categories = allCategories.filter((item) => item.showInProducts !== false);
  const heroImage = mediaUrl(page.heroImage);

  const category = categories.find((item) => item.slug === first(raw.category));
  const subCategory = category?.children?.find((item) => item.slug === first(raw.sub));
  const sort = SORTS.includes(first(raw.sort) ?? '') ? (first(raw.sort) as string) : 'featured';
  const q = (first(raw.q) ?? '').trim().slice(0, 80);
  const num = (value?: string) => {
    const n = Number.parseFloat(value ?? '');
    return Number.isFinite(n) && n >= 0 ? n : undefined;
  };
  const min = num(first(raw.min));
  const max = num(first(raw.max));
  const inStockOnly = first(raw.stock) === '1';
  const onSaleOnly = first(raw.sale) === '1';
  const minRating = ['3', '4'].includes(first(raw.rating) ?? '') ? Number(first(raw.rating)) : undefined;
  const needle = q.toLowerCase();

  let visible = products.filter((product) => {
    if (subCategory) return product.category?.slug === subCategory.slug;
    if (category) return product.category?.slug === category.slug || product.category?.parent?.slug === category.slug;
    return true;
  });
  visible = visible.filter((product) => {
    if (needle && !`${product.name} ${product.shortDescription ?? ''} ${product.sku ?? ''} ${product.category?.name ?? ''} ${product.category?.parent?.name ?? ''}`.toLowerCase().includes(needle)) return false;
    if (min != null && (product.price ?? 0) < min) return false;
    if (max != null && (product.price ?? 0) > max) return false;
    if (inStockOnly && product.stock != null && product.stock <= 0) return false;
    if (onSaleOnly && discountPercent(product.price, product.compareAtPrice) <= 0) return false;
    if (minRating != null && (product.rating ?? 0) < minRating) return false;
    return true;
  });
  visible = [...visible].sort((a, b) => {
    if (sort === 'price-asc') return (a.price ?? 0) - (b.price ?? 0);
    if (sort === 'price-desc') return (b.price ?? 0) - (a.price ?? 0);
    if (sort === 'rating') return (b.rating ?? 0) - (a.rating ?? 0) || (b.reviewCount ?? 0) - (a.reviewCount ?? 0);
    if (sort === 'discount') return discountPercent(b.price, b.compareAtPrice) - discountPercent(a.price, a.compareAtPrice);
    if (sort === 'name-desc') return b.name.localeCompare(a.name);
    if (sort === 'name-asc') return a.name.localeCompare(b.name);
    return Number(b.featured ?? false) - Number(a.featured ?? false) || a.name.localeCompare(b.name);
  });

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const current = Math.min(Math.max(Number.parseInt(first(raw.page) ?? '1', 10) || 1, 1), pages);
  const shown = visible.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);
  const from = visible.length === 0 ? 0 : (current - 1) * PAGE_SIZE + 1;
  const to = Math.min(current * PAGE_SIZE, visible.length);
  const query: Query = {
    category: category?.slug,
    sub: subCategory?.slug,
    sort: sort === 'featured' ? undefined : sort,
    q: q || undefined,
    min: min != null ? String(min) : undefined,
    max: max != null ? String(max) : undefined,
    stock: inStockOnly ? '1' : undefined,
    sale: onSaleOnly ? '1' : undefined,
    rating: minRating != null ? String(minRating) : undefined,
  };
  const anyFilter = Boolean(category || q || min != null || max != null || inStockOnly || onSaleOnly || minRating != null);
  const chip = 'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition hover:shadow-sm';

  return (
    <>
      <ScrollProgress />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff5f6] via-white to-[#fff0f2]">
        <div className="float-slow pointer-events-none absolute -top-16 right-[22%] hidden size-[30rem] rounded-full bg-gradient-to-br from-[#fbd5da] to-[#fde9ec]/40 lg:block" aria-hidden="true" />
        {heroImage && (
          <div className="hero-in absolute inset-y-0 right-0 hidden w-[52%] [animation-delay:200ms] [mask-image:linear-gradient(to_right,transparent_0%,black_38%)] lg:block">
            <Image src={heroImage} alt={page.heroImage?.alternativeText ?? ''} fill priority sizes="55vw" className="object-cover object-right" />
          </div>
        )}
        <div className="container-page relative py-8 lg:py-9">
          {page.eyebrow && (
            <p className="hero-in flex items-center gap-3 text-lg text-navy-950">
              {page.eyebrow}
              <span className="h-0.5 w-12 bg-brand-500" aria-hidden="true" />
            </p>
          )}
          <h1 className="hero-in mt-1 text-4xl font-extrabold tracking-tight text-navy-950 [animation-delay:100ms] sm:text-5xl">{page.title}</h1>
          {page.subtitle && <p className="hero-in mt-2 max-w-md text-lg leading-snug text-navy-900 [animation-delay:220ms]">{page.subtitle}</p>}
        </div>
        {heroImage && (
          <div className="relative h-32 lg:hidden">
            <Image src={heroImage} alt="" fill sizes="100vw" className="object-cover object-right" />
          </div>
        )}
      </section>

      <section className="py-10">
        <div className="container-page grid gap-8 lg:grid-cols-[17rem_1fr] xl:grid-cols-[18.5rem_1fr]">
          <Sidebar categories={categories} products={products} category={category?.slug} sub={subCategory?.slug} filtered={anyFilter} keep={{ ...query, category: undefined, sub: undefined, page: undefined }} />

          <div>
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
              <div>
                <h2 className="text-2xl font-bold text-navy-950">{subCategory?.name ?? category?.name ?? 'All Products'}</h2>
                <p className="mt-1 text-sm text-muted">
                  {visible.length === 0 ? 'No products found' : `Showing ${from}–${to} of ${visible.length} ${visible.length === 1 ? 'result' : 'results'}`}
                  {category && ' under selected category'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Suspense fallback={null}>
                  <FilterMenu />
                </Suspense>
                <Suspense fallback={null}>
                  <SortSelect value={sort} />
                </Suspense>
              </div>
            </div>

            {anyFilter && (
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-muted">Active filters:</span>
                {category && (
                  <Link href={link({ ...query, category: undefined, sub: undefined, page: undefined })} className={`${chip} border-navy-950/15 bg-surface text-navy-950`}>
                    Category: {category.name} <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove category filter</span>
                  </Link>
                )}
                {q && (
                  <Link href={link({ ...query, q: undefined, page: undefined })} className={`${chip} border-navy-950/15 bg-surface text-navy-950`}>
                    Search: {q} <span aria-hidden="true">×</span>
                  </Link>
                )}
                {(min != null || max != null) && (
                  <Link href={link({ ...query, min: undefined, max: undefined, page: undefined })} className={`${chip} border-navy-950/15 bg-surface text-navy-950`}>
                    Price: {min != null ? formatPrice(min) : '₹0'} – {max != null ? formatPrice(max) : 'any'} <span aria-hidden="true">×</span>
                  </Link>
                )}
                {inStockOnly && (
                  <Link href={link({ ...query, stock: undefined, page: undefined })} className={`${chip} border-navy-950/15 bg-surface text-navy-950`}>
                    In stock <span aria-hidden="true">×</span>
                  </Link>
                )}
                {onSaleOnly && (
                  <Link href={link({ ...query, sale: undefined, page: undefined })} className={`${chip} border-navy-950/15 bg-surface text-navy-950`}>
                    On sale <span aria-hidden="true">×</span>
                  </Link>
                )}
                {minRating != null && (
                  <Link href={link({ ...query, rating: undefined, page: undefined })} className={`${chip} border-navy-950/15 bg-surface text-navy-950`}>
                    {minRating}★ &amp; up <span aria-hidden="true">×</span>
                  </Link>
                )}
                {subCategory && category && (
                  <Link href={link({ ...query, sub: undefined, page: undefined })} className={`${chip} border-brand-500/30 bg-brand-50 text-brand-500`}>
                    Sub: {subCategory.name} <span aria-hidden="true">×</span>
                    <span className="sr-only">Remove sub-category filter</span>
                  </Link>
                )}
                <Link href="/products" className="font-semibold text-navy-900 underline-offset-2 hover:text-brand-500 hover:underline">
                  Clear all
                </Link>
              </div>
            )}

            {shown.length > 0 ? (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((product, index) => (
                  <Reveal as="li" key={product.documentId} delay={(index % 3) * 80} className="h-full [&>*]:h-full">
                    <ProductCard product={product} />
                  </Reveal>
                ))}
              </ul>
            ) : (
              <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-14 text-center">
                <p className="text-lg font-bold text-navy-950">No products match your search</p>
                <p className="mt-1 text-sm text-muted">Try a different word, widen the price range, or talk to our team about what you need.</p>
                <Link href="/products" className="btn-primary mt-5">View all products</Link>
              </div>
            )}

            <Pagination page={current} pages={pages} query={query} />
          </div>
        </div>
      </section>
    </>
  );
}
