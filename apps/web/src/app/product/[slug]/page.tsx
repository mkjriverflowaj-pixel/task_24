import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/ProductCard';
import { ProductGallery } from '@/components/ProductGallery';
import { BuyBox } from '@/components/store/AddToCart';
import { StoreAssurances } from '@/components/store/StoreAssurances';
import { Price } from '@/components/store/Price';
import { Stars } from '@/components/store/Stars';
import { Reveal } from '@/components/Reveal';
import { ScrollProgress } from '@/components/ScrollProgress';
import { getProduct, getRelatedProducts, getSiteSetting, mediaUrl } from '@/lib/strapi';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);
  if (!product) return {};
  return { title: product.name, description: product.shortDescription ?? undefined };
}

function Heading({ children }: { children: React.ReactNode }) {
  return (
    <Reveal>
      <h2 className="text-2xl font-bold text-navy-950 sm:text-3xl">{children}</h2>
      <span className="mt-3 block h-0.5 w-14 bg-brand-500" aria-hidden="true" />
    </Reveal>
  );
}

export default async function ProductPage({ params }: Props) {
  const slug = (await params).slug;
  const [product, site] = await Promise.all([getProduct(slug), getSiteSetting()]);
  if (!product) notFound();

  const related = product.category ? await getRelatedProducts(product.category.slug, product.slug) : [];
  const images = (product.images ?? []).map((image) => ({ src: mediaUrl(image)!, alt: image.alternativeText ?? product.name }));
  const features = product.features ?? [];
  const specs = product.specifications ?? [];
  const details = product.details ?? [];
  // One text for "About": the full description, or the short brief if there is no description. Never both.
  const placeholder = /replace this text|sample description/i.test(product.description ?? '');
  const paragraphs = ((placeholder ? product.brief : product.description) || product.brief || product.description || '').split(/\n{2,}/).filter(Boolean);
  // "More about the product" only keeps what is not already shown above (code, range and specs, features).
  const detailRows = details.filter((row) => {
    const label = row.label.trim().toLowerCase();
    if (label === 'product code' || label === 'product range') return false;
    if (label === 'technical specifications' && specs.length > 0) return false;
    return true;
  });
  if (features.length > 0 && !detailRows.some((row) => /features/i.test(row.label))) {
    detailRows.push({ id: -1, label: 'Product Features', value: features.map((feature) => feature.title).join('\n'), asList: true });
  }
  const out = product.stock != null && product.stock <= 0;
  const low = product.stock != null && product.stock > 0 && product.stock <= 5;
  const glance: [string, string][] = [
    ...(specs.some((spec) => /^brand$/i.test(spec.label)) ? [] : ([['Brand', 'Safonix']] as [string, string][])),
    ...specs.slice(0, 6).map((spec) => [spec.label, spec.value] as [string, string]),
  ];
  const tel = site.phone?.replace(/[^+\d]/g, '');
  const parent = product.category?.parent;

  return (
    <>
      <ScrollProgress />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff5f6] via-white to-[#fff0f2]">
        <div className="float-slow pointer-events-none absolute -right-24 -top-24 size-[24rem] rounded-full bg-gradient-to-br from-[#fbd5da] to-[#fde9ec]/40" aria-hidden="true" />
        <div className="container-page relative py-8 lg:py-12">
          <nav aria-label="Breadcrumb" className="hero-in text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="transition hover:text-brand-500">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/products" className="transition hover:text-brand-500">Products</Link></li>
              {parent && (
                <>
                  <li aria-hidden="true">/</li>
                  <li><Link href={`/products/${parent.slug}`} className="transition hover:text-brand-500">{parent.name}</Link></li>
                </>
              )}
              {product.category && (
                <>
                  <li aria-hidden="true">/</li>
                  <li><Link href={`/products/${product.category.slug}`} className="transition hover:text-brand-500">{product.category.name}</Link></li>
                </>
              )}
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-semibold text-navy-950">{product.name}</li>
            </ol>
          </nav>

          <div className="mt-8 grid items-start gap-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
            <div className="hero-in [animation-delay:100ms]">
              <ProductGallery images={images} name={product.name} />
            </div>

            <div>
              <div className="hero-in flex flex-wrap items-center gap-3 [animation-delay:150ms]">
                {product.badge && <span className="rounded-full bg-brand-500 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">{product.badge}</span>}
                {product.category && <span className="text-sm font-bold uppercase tracking-[0.18em] text-brand-500">{product.category.name}</span>}
              </div>
              <h1 className="hero-in mt-3 text-3xl font-extrabold tracking-tight text-navy-950 [animation-delay:200ms] sm:text-4xl lg:text-5xl">{product.name}</h1>
              {product.sku && <p className="hero-in mt-2 text-sm text-muted [animation-delay:240ms]">Product code: <span className="font-semibold text-navy-900">{product.sku.replace(/-{2,}/g, '-')}</span></p>}
              <div className="hero-in mt-4 [animation-delay:250ms]">
                <Stars rating={product.rating} count={product.reviewCount} size="md" />
              </div>
              {product.price != null && (
                <div className="hero-in mt-4 [animation-delay:270ms]">
                  <Price price={product.price} compareAt={product.compareAtPrice} unit={product.unit} size="lg" />
                  <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
                </div>
              )}
              {product.shortDescription && <p className="hero-in mt-4 text-base italic leading-relaxed text-navy-900 [animation-delay:280ms] sm:text-lg">“{product.shortDescription.replace(/^[“"]|[”"]$/g, '')}”</p>}

              {product.price != null && product.variantId && (
                <div className="hero-in [animation-delay:300ms]">
                  <BuyBox
                    product={{
                      variantId: product.variantId,
                      slug: product.slug,
                      name: product.name,
                      price: product.price,
                      mrp: product.compareAtPrice,
                      image: images[0]?.src ?? null,
                      unit: product.unit,
                      stock: product.stock,
                    }}
                  />
                </div>
              )}

              <div className="hero-in mt-8 flex flex-wrap items-center gap-3 [animation-delay:380ms]">
                <Link href="/contact-us" className="btn-primary">
                  Bulk / project enquiry
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                </Link>
                {site.phone && tel && (
                  <a href={`tel:${tel}`} className="inline-flex items-center gap-2 rounded-full border border-brand-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-brand-500 hover:text-white">
                    Call {site.phone}
                  </a>
                )}
              </div>

              <div className="hero-in mt-5 [animation-delay:460ms]">
                <StoreAssurances />
              </div>
            </div>
          </div>
        </div>
      </section>

      {(paragraphs.length > 0 || glance.length > 1) && (
        <section className="py-12 lg:py-16">
          <div className="container-page grid items-start gap-10 lg:grid-cols-[1fr_23rem] lg:gap-16">
            <div>
              <Reveal>
                <h2 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
                  <span className="text-brand-500">01.</span> About This Product
                </h2>
              </Reveal>
              <Reveal delay={80}>
                <div className="mt-6 space-y-4 text-lg leading-relaxed text-navy-900/85">
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </Reveal>
            </div>
            <Reveal delay={120}>
              <aside aria-label="At a glance" className="rounded-2xl border border-navy-950/60 bg-white p-6 shadow-[0_10px_30px_rgba(20,32,46,0.08)]">
                <h3 className="text-xl font-extrabold text-navy-950">At a Glance</h3>
                <dl className="mt-4 space-y-2.5 text-[15px]">
                  {glance.map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <dt className="shrink-0 font-semibold text-navy-950">{label}:</dt>
                      <dd className="text-navy-900/85">{value}</dd>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <dt className="shrink-0 font-semibold text-navy-950">Availability:</dt>
                    <dd className={'font-semibold ' + (out ? 'text-brand-500' : low ? 'text-[#d97706]' : 'text-[#1a9b55]')}>{out ? 'Out of stock' : low ? 'Only ' + product.stock + ' left' : 'In Stock'}</dd>
                  </div>
                </dl>
              </aside>
            </Reveal>
          </div>
        </section>
      )}

      {detailRows.length > 0 && (
        <section className="pb-14">
          <div className="container-page">
            {/* Native open/close box: the heading row toggles the table, a minus turns into a plus when closed. */}
            <details open className="group overflow-hidden rounded-2xl border border-line bg-white shadow-[0_8px_26px_rgba(20,32,46,0.07)]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-lg font-bold text-navy-950 transition hover:text-brand-500 sm:px-8 [&::-webkit-details-marker]:hidden">
                More About the Product
                <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="M12 5v14" className="group-open:hidden" />
                </svg>
              </summary>
              <dl className="divide-y divide-line border-t border-line px-6 sm:px-8">
                {detailRows.map((row, index) => {
                  const lines = (row.value ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
                  return (
                    <div key={`${row.label}-${index}`} className="grid gap-1 py-4 text-[15px] sm:grid-cols-[13rem_1fr] sm:gap-8">
                      <dt className="font-bold text-navy-950">{row.label}</dt>
                      <dd className="leading-relaxed text-muted">
                        {row.asList ? (
                          <ul className="list-disc space-y-1 pl-5 marker:text-brand-500">
                            {lines.map((line) => (
                              <li key={line}>{line}</li>
                            ))}
                          </ul>
                        ) : (
                          lines.map((line) => <p key={line}>{line}</p>)
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </details>
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="py-14">
          <div className="container-page">
            <Heading>More from {product.category?.name}</Heading>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item, index) => (
                <Reveal as="li" key={item.documentId} delay={(index % 4) * 90}>
                  <ProductCard product={item} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
