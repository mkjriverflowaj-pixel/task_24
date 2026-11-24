import type { Capability } from '@/lib/strapi';
import { Accent } from './Accent';
import { Reveal } from './Reveal';
import { SectionIcon } from './SectionIcon';

/** Soft grey band: heading and intro side by side, then a row of cards (icon, title, text and a short tick list). */
export function CapabilitiesSection({
  eyebrow,
  title,
  text,
  items,
}: {
  eyebrow?: string | null;
  title?: string | null;
  text?: string | null;
  items: Capability[];
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#f8f4f5] to-white pb-12 pt-8">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-gradient-to-br from-[#fde3e6] to-transparent" aria-hidden="true" />
      <div className="container-page relative">
        <Reveal className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">{eyebrow}</p>}
            {title && (
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                <Accent text={title} />
              </h2>
            )}
            <span className="heading-rule mt-4 block h-0.5 w-14 rounded bg-brand-500" aria-hidden="true" />
          </div>
          {text && <p className="max-w-md text-[15px] leading-relaxed text-muted">{text}</p>}
        </Reveal>

        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((item, index) => {
            const bullets = (item.bullets ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
            return (
              <Reveal as="li" key={item.id} delay={(index % 4) * 100}>
                <div className="group h-full rounded-2xl border border-line bg-white p-6 shadow-[0_6px_20px_rgba(20,32,46,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-[0_16px_32px_rgba(20,32,46,0.13)]">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand-50 text-brand-500 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                    <SectionIcon name={item.icon} />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-navy-950">{item.title}</h3>
                  {item.description && <p className="mt-2 text-[14px] leading-relaxed text-muted">{item.description}</p>}
                  {bullets.length > 0 && (
                    <ul className="mt-4 space-y-1.5 border-t border-line pt-4">
                      {bullets.map((line) => (
                        <li key={line} className="flex items-start gap-2 text-[13px] font-medium text-navy-900">
                          <svg viewBox="0 0 24 24" className="mt-0.5 size-3.5 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="m9 6 6 6-6 6" />
                          </svg>
                          {line}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
