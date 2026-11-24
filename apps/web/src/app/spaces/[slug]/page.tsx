import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CategoryCard } from '@/components/CategoryCard';
import { Reveal } from '@/components/Reveal';
import { ScrollProgress } from '@/components/ScrollProgress';
import { ArrowRight } from '@/components/icons';
import Image from 'next/image';
import { getSpace, getSpaces, mediaUrl } from '@/lib/strapi';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const spaces = await getSpaces();
  return spaces.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const space = await getSpace((await params).slug);
  if (!space) return {};
  return { title: space.name, description: space.description ?? undefined };
}

/** A space (Living Spaces, Offices & Shops...) and the product groups chosen for it in Strapi → Spaces. */
export default async function SpacePage({ params }: Props) {
  const slug = (await params).slug;
  const [space, all] = await Promise.all([getSpace(slug), getSpaces()]);
  if (!space) notFound();

  const categories = space.categories ?? [];
  const picture = mediaUrl(space.image);

  return (
    <>
      <ScrollProgress />

      {/* Banner like the Contact page: text on the left, the space's picture fading in from the right. */}
      <section className="relative overflow-hidden bg-[#f6f5f4]">
        {picture && (
          <div className="hero-in absolute inset-y-0 right-0 hidden w-[58%] [animation-delay:200ms] [mask-image:linear-gradient(to_right,transparent_0%,black_45%)] lg:block">
            <Image src={picture} alt={space.image?.alternativeText ?? space.name} fill priority sizes="60vw" className="object-cover object-[center_38%]" />
          </div>
        )}
        <div className="container-page relative py-7 lg:py-16">
          <nav aria-label="Breadcrumb" className="hero-in text-sm text-muted">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="transition hover:text-brand-500">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-navy-950">{space.name}</li>
            </ol>
          </nav>
          {space.tag && (
            <p className="hero-in mt-5 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-navy-950 [animation-delay:60ms]">
              <span className="h-0.5 w-9 bg-brand-500" aria-hidden="true" />
              {space.tag}
            </p>
          )}
          <h1 className="hero-in mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-navy-950 [animation-delay:120ms] sm:text-4xl lg:text-5xl">{space.name}</h1>
          {space.description && <p className="hero-in mt-4 max-w-md text-[16px] leading-relaxed text-navy-900 [animation-delay:200ms]">{space.description}</p>}
        </div>
        {picture && (
          <div className="relative h-40 lg:hidden">
            <Image src={picture} alt="" fill sizes="100vw" className="object-cover object-center" />
          </div>
        )}
      </section>

      {all.length > 1 && (
        <section className="pt-6">
          <div className="container-page">
            <h2 className="text-xl font-bold text-navy-950">Other spaces</h2>
            <nav aria-label="Spaces" className="mt-4 flex flex-wrap items-center gap-3">
              {all.map((item) =>
                item.slug === space.slug ? (
                  <span key={item.documentId} aria-current="page" className="inline-flex items-center gap-2.5 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-white shadow-[0_10px_20px_-8px_rgba(217,59,52,0.7)]">
                    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m3 12.5 4.5 4.5L14 8.500M10 16l1 1 9-10" />
                    </svg>
                    {item.name}
                    {categories.length > 0 && <span className="grid h-6 min-w-6 place-items-center rounded-full bg-white/25 px-1.5 text-xs font-bold">{categories.length}</span>}
                  </span>
                ) : (
                  <Link key={item.documentId} href={`/spaces/${item.slug}`} className="inline-flex rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:-translate-y-0.5 hover:border-brand-500 hover:text-brand-500 hover:shadow-md">
                    {item.name}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </section>
      )}

      <section className="py-10 sm:py-14">
        <div className="container-page">
          <Reveal>
            <h2 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
              Product groups for <span className="text-brand-500">{space.name}</span>
            </h2>
            <span className="heading-rule mt-3 block h-0.5 w-14 rounded bg-brand-500" aria-hidden="true" />
          </Reveal>

          {categories.length > 0 ? (
            <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category, index) => (
                <Reveal as="li" key={category.documentId} delay={(index % 4) * 90} className="h-full [&>a]:h-full">
                  <CategoryCard category={category} />
                </Reveal>
              ))}
            </ul>
          ) : (
            <p className="mt-8 text-muted">Product groups for this space are coming soon.</p>
          )}

          <div className="mt-10">
            <Link href="/products" className="btn-primary">
              See all products
              <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

    </>
  );
}
