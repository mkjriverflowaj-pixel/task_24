import type { Milestone } from '@/lib/strapi';
import { Accent } from './Accent';
import { Reveal } from './Reveal';

/**
 * Timeline across the page width: a red line on the left with a dot per milestone, the year beside it and a wide card
 * on the right. The milestone marked "current" is highlighted in red. All text comes from Strapi.
 */
export function Timeline({
  eyebrow,
  title,
  subtitle,
  items,
}: {
  eyebrow?: string | null;
  title?: string | null;
  subtitle?: string | null;
  items: Milestone[];
}) {
  return (
    <section className="relative overflow-hidden py-12">
      <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-gradient-to-br from-[#fde3e6] to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-10 size-72 rounded-full bg-gradient-to-tl from-[#fde3e6] to-transparent" aria-hidden="true" />
      <div className="container-page relative">
        <Reveal className="text-center">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">{eyebrow}</p>}
          {title && (
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              <Accent text={title} />
            </h2>
          )}
          <span className="heading-rule mx-auto mt-4 block h-0.5 w-14 rounded bg-brand-500" aria-hidden="true" />
          {subtitle && <p className="mx-auto mt-3 max-w-xl text-muted">{subtitle}</p>}
        </Reveal>

        <ol className="relative mt-10">
          <span className="absolute bottom-3 left-[5.6rem] top-3 w-px bg-gradient-to-b from-brand-500/60 via-brand-500/30 to-transparent sm:left-[6.9rem]" aria-hidden="true" />
          {items.map((item, index) => {
            const isYear = /^\d{4}\+?$/.test(item.year);
            return (
              <Reveal as="li" key={item.id} delay={index * 100} className="relative grid grid-cols-[4rem_0.75rem_1fr] items-start gap-x-5 pb-6 last:pb-0 sm:grid-cols-[5rem_0.75rem_1fr] sm:gap-x-6">
                <span
                  className={`font-extrabold ${item.current ? 'text-brand-500' : 'text-navy-950'} ${
                    isYear ? 'pt-4 text-right text-xl tabular-nums sm:text-2xl' : 'pt-[1.4rem] text-right text-xs uppercase tracking-wider sm:text-[13px]'
                  }`}
                >
                  {item.year}
                </span>
                <span className="relative mt-5 grid size-3 place-items-center" aria-hidden="true">
                  <span className={`size-3 rounded-full border-2 bg-white ${item.current ? 'border-brand-500 bg-brand-500' : 'border-brand-500'}`} />
                  {item.current && <span className="absolute size-3 animate-ping rounded-full bg-brand-500/60" />}
                </span>
                <div
                  className={`group rounded-2xl border p-5 transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(20,32,46,0.12)] sm:px-7 ${
                    item.current ? 'border-brand-500/30 bg-gradient-to-br from-[#fff1f3] to-white shadow-[0_8px_24px_rgba(217,59,52,0.12)]' : 'border-line bg-white shadow-[0_6px_20px_rgba(20,32,46,0.06)]'
                  }`}
                >
                  {item.current && <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-500">Where we are now</p>}
                  <h3 className="text-lg font-bold text-navy-950 transition-colors duration-300 group-hover:text-brand-500">{item.title}</h3>
                  {item.description && <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{item.description}</p>}
                </div>
              </Reveal>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
