import type { Leader } from '@/lib/strapi';
import { Accent } from './Accent';
import { Reveal } from './Reveal';
import { SectionIcon } from './SectionIcon';

/** Centred heading, then cards with a round icon, role, unit, a short line and a small badge at the bottom. */
export function LeadershipSection({
  eyebrow,
  title,
  text,
  items,
}: {
  eyebrow?: string | null;
  title?: string | null;
  text?: string | null;
  items: Leader[];
}) {
  return (
    <section className="py-12">
      <div className="container-page">
        <Reveal className="text-center">
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">{eyebrow}</p>}
          {title && (
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
              <Accent text={title} />
            </h2>
          )}
          <span className="heading-rule mx-auto mt-4 block h-0.5 w-14 rounded bg-brand-500" aria-hidden="true" />
          {text && <p className="mx-auto mt-3 max-w-xl text-muted">{text}</p>}
        </Reveal>

        <ul className="mt-9 grid gap-5 md:grid-cols-3">
          {items.map((item, index) => (
            <Reveal as="li" key={item.id} delay={(index % 3) * 100}>
              <div className="group flex h-full flex-col items-center rounded-2xl border border-line bg-white p-6 text-center shadow-[0_6px_20px_rgba(20,32,46,0.06)] transition duration-300 hover:-translate-y-1.5 hover:border-brand-500/40 hover:shadow-[0_16px_32px_rgba(20,32,46,0.13)]">
                <span className="grid size-16 place-items-center rounded-full border border-brand-500/20 bg-brand-50 text-brand-500 transition duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">
                  <SectionIcon name={item.icon} className="size-7" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-navy-950">{item.role}</h3>
                {item.unit && <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-brand-500">{item.unit}</p>}
                {item.text && <p className="mt-3 text-[14px] leading-relaxed text-muted">{item.text}</p>}
                {item.badge && (
                  <div className="mt-auto w-full pt-4">
                    <p className="border-t border-line pt-4 text-xs font-semibold text-navy-900">{item.badge}</p>
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
