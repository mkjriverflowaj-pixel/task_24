import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl, type SpaceCard } from '@/lib/strapi';
import { Accent } from './Accent';
import { ArrowRight } from './icons';
import { Reveal } from './Reveal';
import { Tilt3D } from './Tilt3D';

/**
 * Dark red showcase band: tall cards, each with a product floating over a red glow, then a small label, a title and a short line.
 * Every card opens its space page. The cards come from Strapi → Spaces (name, tag, card text, picture); if that list is empty
 * the older Home Page → Spaces cards are used.
 */
export function SpaceCards({
  eyebrow,
  title,
  subtitle,
  cards,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  cards: SpaceCard[];
}) {
  return (
    <section className="relative my-6 overflow-hidden bg-[#12060a] py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_65%_55%_at_12%_0%,rgba(227,38,45,0.38),transparent_70%),radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(227,38,45,0.3),transparent_70%),radial-gradient(ellipse_40%_40%_at_55%_45%,rgba(120,12,24,0.35),transparent_75%)]" aria-hidden="true" />
      <div className="pointer-events-none parallax-drift absolute -left-32 -top-32 size-96 rounded-full bg-brand-500/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none parallax-drift absolute -bottom-40 right-0 size-[28rem] rounded-full bg-[#ff4b52]/15 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent" aria-hidden="true" />

      <div className="container-page relative">
        <Reveal>
          {eyebrow && (
            <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.25em] text-brand-400">
              <span className="h-0.5 w-8 bg-brand-500" aria-hidden="true" />
              {eyebrow}
            </p>
          )}
          {title && (
            <h2 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">
              <Accent text={title} className="text-brand-400" />
            </h2>
          )}
          {subtitle && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-white/70">{subtitle}</p>}
        </Reveal>

        <ul className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card, index) => {
            const image = mediaUrl(card.image);
            const body = (
              <>
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_36%,rgba(255,75,70,0.35),transparent_60%)] transition duration-500 group-hover:scale-110" aria-hidden="true" />
                {image && (
                  <div className="absolute inset-x-3 top-3 h-[62%] overflow-hidden rounded-[1.25rem] shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
                    <Image
                      src={image}
                      alt={card.image?.alternativeText ?? card.title}
                      fill
                      sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/85 to-transparent px-5 pb-4 pt-16">
                  {card.tag && <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ff4b52]">{card.tag}</p>}
                  <h3 className="mt-1 flex items-center justify-between gap-3 text-xl font-bold leading-snug">
                    {card.title}
                    {card.link && (
                      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition duration-300 group-hover:translate-x-0.5 group-hover:bg-brand-500">
                        <ArrowRight className="size-4" />
                      </span>
                    )}
                  </h3>
                  {card.description && <p className="mt-1.5 text-[13.5px] leading-snug text-white/75">{card.description}</p>}
                </div>
              </>
            );
            const className =
              'group relative block aspect-[10/11] overflow-hidden rounded-3xl border border-[#ff4b52]/35 bg-gradient-to-b from-[#43171c] to-[#1c0d10] shadow-[0_0_0_1px_rgba(255,75,82,0.08),0_26px_60px_-26px_rgba(227,38,45,0.75)] transition duration-300 hover:-translate-y-1.5 hover:border-[#ff4b52]/75';
            return (
              <Reveal as="li" key={card.id} delay={(index % 4) * 100} variant={(['3d-left', '3d', '3d', '3d-right'] as const)[index % 4]}>
                <Tilt3D radius="1.5rem" strength={8}>
                {card.link ? (
                  <Link href={card.link} className={className}>
                    {body}
                  </Link>
                ) : (
                  <div className={className}>{body}</div>
                )}
                </Tilt3D>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
