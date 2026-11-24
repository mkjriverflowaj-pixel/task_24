import type { Feature } from '@/lib/strapi';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const icons = [
  // certificate with a seal
  <svg key="cert" viewBox="0 0 48 48" className="size-7" aria-hidden="true">
    <g {...stroke}>
      <path d="M32 40H9V7h26v18" />
      <path d="M15 15h14M15 21h8M15 27h6" />
      <circle cx="35" cy="33" r="6" />
      <path d="m31.5 38-1.5 6 5-2 5 2-1.5-6" />
    </g>
  </svg>,
  // sprout held in hands
  <svg key="eco" viewBox="0 0 48 48" className="size-7" aria-hidden="true">
    <g {...stroke}>
      <path d="M24 30V16" />
      <path d="M24 20c-1-6-5-8-9-8 0 5 3 8 9 8ZM24 17c1-5 4-7 9-7 0 5-3 8-9 7Z" />
      <path d="M6 30c4 0 7 2 9 5l5 4M42 30c-4 0-7 2-9 5l-5 4" />
      <path d="M12 44c-3-2-6-4-6-8M36 44c3-2 6-4 6-8" />
    </g>
  </svg>,
  // support chat bubble
  <svg key="support" viewBox="0 0 48 48" className="size-7" aria-hidden="true">
    <g {...stroke}>
      <path d="M8 22a16 16 0 0 1 32 0v6" />
      <rect x="5" y="22" width="7" height="12" rx="3" />
      <rect x="36" y="22" width="7" height="12" rx="3" />
      <path d="M40 34c0 6-6 8-12 8" />
    </g>
    <g fill="currentColor">
      <circle cx="18" cy="23" r="2" />
      <circle cx="24" cy="23" r="2" />
      <circle cx="30" cy="23" r="2" />
    </g>
  </svg>,
  // shield with a check
  <svg key="warranty" viewBox="0 0 48 48" className="size-7" aria-hidden="true">
    <g {...stroke}>
      <path d="M24 9 36 13v10c0 8-5 13-12 16C17 36 12 31 12 23V13z" />
      <path d="m18 24 5 5 8-10" />
      <path d="M8 24c0-8 4-14 10-17M40 24c0-8-4-14-10-17" strokeDasharray="2 4" />
    </g>
  </svg>,
];

/** White card under the hero: four short promises, each with a red icon in a pink circle. */
export function FeatureStrip({ items }: { items: Feature[] }) {
  return (
    <section className="container-page pb-8 pt-6" aria-label="Why Safonix">
      <ul className="grid gap-y-6 rounded-2xl border border-line bg-white px-2 py-5 shadow-[0_10px_30px_rgba(20,32,46,0.07)] sm:grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-line">
        {items.map((item, index) => (
          <li key={item.id} className="group flex items-center gap-4 px-5">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500 transition duration-300 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white">{icons[index % icons.length]}</span>
            <div>
              <h3 className="font-semibold leading-snug text-navy-950">{item.title}</h3>
              {item.description && <p className="mt-1 text-sm leading-snug text-muted">{item.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
