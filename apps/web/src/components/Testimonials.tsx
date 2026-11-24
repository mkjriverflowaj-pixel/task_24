import type { Testimonial } from '@/lib/strapi';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

const tints = ['bg-brand-500', 'bg-[#ff7a2f]', 'bg-[#c8161d]', 'bg-[#22a05a]'];

function Card({ item, index }: { item: Testimonial; index: number }) {
  return (
    <figure className="w-[17.6rem] flex-none rounded-[1.2rem] border border-line bg-white p-5 shadow-[0_14px_40px_-26px_rgba(80,10,20,0.35)] sm:w-[19.2rem]">
      <h3 className="text-[11px] font-bold leading-snug text-navy-950">{item.title}</h3>
      <blockquote className="mt-1.5 text-xs leading-relaxed text-navy-900">&ldquo;{item.quote}&rdquo;</blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5 text-[11px] text-muted">
        <span className={`grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold text-white ${tints[index % tints.length]}`}>{initials(item.name)}</span>
        <span>
          <b className="block text-navy-950">{item.name}</b>
          {item.company}
        </span>
      </figcaption>
    </figure>
  );
}

/** One endless row of customer quotes; hovering pauses it. */
export function Testimonials({ items, seconds }: { items: Testimonial[]; seconds?: number }) {
  // Short lists are repeated so the row is always wider than the screen and loops without a gap.
  const base = items.length >= 4 ? items : [...items, ...items, ...items];
  const row = [...base, ...base];

  return (
    <div className="overflow-hidden">
      <div className="testi-row" style={seconds ? { animationDuration: `${seconds}s` } : undefined}>
        {row.map((item, index) => (
          <Card key={`${item.documentId}-${index}`} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
