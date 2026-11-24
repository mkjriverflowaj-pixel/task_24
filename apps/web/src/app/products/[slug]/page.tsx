import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryCard } from '@/components/CategoryCard';
import { ProductCard } from '@/components/ProductCard';
import { Reveal } from '@/components/Reveal';
import { ScrollProgress } from '@/components/ScrollProgress';
import { getAllCategorySlugs, getCategory, getProductsInCategory, getSiteSetting, getTopCategories, mediaUrl } from '@/lib/strapi';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getAllCategorySlugs();
  return categories.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const category = await getCategory((await params).slug);
  if (!category) return {};
  return { title: category.name, description: category.tagline ?? category.description ?? undefined };
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m5 12.5 4.500 4.500L19 7.500" />
    </svg>
  );
}

export default async function CategoryPage({ params }: Props) {
  const slug = (await params).slug;
  const [category, site, topCategories, products] = await Promise.all([getCategory(slug), getSiteSetting(), getTopCategories(), getProductsInCategory(slug)]);
  if (!category) notFound();

  const children = [...(category.children ?? [])].sort((a, b) => a.order - b.order);
  const highlights = category.highlights ?? [];
  const parent = category.parent;
  const image = mediaUrl(category.image);
  const tel = site.phone?.replace(/[^+\d]/g, '');
  const topSlug = parent?.slug ?? category.slug;
  // Other ranges to explore: the main product groups shown on the Products page, except the one being viewed.
  const others = topCategories.filter((item) => item.showInProducts !== false && item.slug !== topSlug);

  return (
    <>
      <ScrollProgress />

      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff5f6] via-white to-[#fff0f2]">
        <div className="float-slow pointer-events-none absolute -right-24 -top-24 size-[26rem] rounded-full bg-gradient-to-br from-[#fbd5da] to-[#fde9ec]/40" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-6 py-6 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:py-8">
          <div>
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
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="font-semibold text-navy-950">{category.name}</li>
              </ol>
            </nav>
            <p className="hero-in mt-6 flex items-center gap-3 text-sm font-bold uppercase tracking-[0.18em] text-brand-500 [animation-delay:80ms]">
              {parent ? parent.name : 'Product Range'}
              <span className="h-0.5 w-10 bg-brand-500" aria-hidden="true" />
            </p>
            <h1 className="hero-in mt-3 text-4xl font-extrabold tracking-tight text-navy-950 [animation-delay:160ms] sm:text-5xl">{category.name}</h1>
            {category.tagline && <p className="hero-in mt-4 max-w-lg text-xl leading-snug text-navy-900 [animation-delay:240ms]">{category.tagline}</p>}
            {category.description && <p className="hero-in mt-3 max-w-lg leading-relaxed text-muted [animation-delay:300ms]">{category.description}</p>}
            <div className="hero-in mt-8 flex flex-wrap items-center gap-3 [animation-delay:360ms]">
              <Link href="/contact-us" className="btn-primary">
                Enquire Now
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
              {site.phone && tel && (
                <a href={`tel:${tel}`} className="inline-flex items-center gap-2 rounded-full border border-brand-500 px-6 py-3 text-sm font-semibold text-navy-950 transition hover:bg-brand-500 hover:text-white">
                  Call {site.phone}
                </a>
              )}
            </div>
          </div>
          {image && (
            <div className="hero-in relative mx-auto aspect-square w-full max-w-[19rem] [animation-delay:200ms]">
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[#fbdde1] to-[#fdeff1]" aria-hidden="true" />
              <Image src={image} alt={category.image?.alternativeText ?? category.name} fill priority sizes="(min-width: 1024px) 400px, 80vw" className="object-contain p-10 drop-shadow-[0_18px_22px_rgba(0,0,0,0.18)] transition duration-500 hover:scale-105" />
            </div>
          )}
        </div>
      </section>

      {others.length > 0 && (
        <section className="pt-6 pb-2">
          <div className="container-page">
            <Reveal>
              <h2 className="text-xl font-bold text-navy-950">Explore other ranges</h2>
              <ul className="mt-5 flex flex-wrap gap-3">
                {others.map((item) => (
                  <li key={item.documentId}>
                    <Link
                      href={`/products/${item.slug}`}
                      className="group inline-flex items-center gap-2 rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy-950 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-500 hover:shadow-md"
                    >
                      {item.name}
                      <svg viewBox="0 0 24 24" className="size-4 text-brand-500 transition group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>
      )}
      {children.length > 0 && (
        <section className="bg-[#fff8f9] py-8">
          <div className="container-page">
            <Reveal>
              <h2 className="text-2xl font-bold text-navy-950 sm:text-3xl">Browse {category.name}</h2>
              <span className="mt-3 block h-0.5 w-14 bg-brand-500" aria-hidden="true" />
            </Reveal>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {children.map((child, index) => (
                <Reveal as="li" key={child.documentId} delay={(index % 4) * 90} className="h-full [&>a]:h-full">
                  <CategoryCard category={child} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section className="py-8">
          <div className="container-page">
            <Reveal>
              <h2 className="text-2xl font-bold text-navy-950 sm:text-3xl">Products</h2>
              <span className="mt-3 block h-0.5 w-14 bg-brand-500" aria-hidden="true" />
            </Reveal>
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {products.map((product, index) => (
                <Reveal as="li" key={product.documentId} delay={(index % 4) * 90} className="h-full [&>*]:h-full">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

      {products.length === 0 && children.length === 0 && (
        <section className="py-8">
          <div className="container-page">
            <p className="text-lg text-muted">Details for {category.name} are coming soon.</p>
          </div>
        </section>
      )}

      {highlights.length > 0 && (
        <section className="bg-[#fff8f9] py-8">
          <div className="container-page">
            <Reveal>
              <h2 className="text-2xl font-bold text-navy-950 sm:text-3xl">
                Why choose <span className="text-brand-500">{category.name}</span>
              </h2>
              <span className="mt-3 block h-0.5 w-14 bg-brand-500" aria-hidden="true" />
            </Reveal>
            <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((item, index) => (
                <Reveal as="li" key={item.id} delay={(index % 3) * 100}>
                  <div className="group flex h-full gap-4 rounded-2xl border border-line bg-white p-5 shadow-[0_6px_20px_rgba(20,32,46,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-[0_16px_32px_rgba(20,32,46,0.13)]">
                    <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500 transition duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                      <Check />
                    </span>
                    <div>
                      <h3 className="font-bold text-navy-950">{item.title}</h3>
                      {item.description && <p className="mt-1 text-sm leading-snug text-muted">{item.description}</p>}
                    </div>
                  </div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>
      )}

    </>
  );
}
