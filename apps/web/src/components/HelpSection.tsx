import Link from 'next/link';
import type { ReactNode } from 'react';
import type { SiteSetting } from '@/lib/strapi';
import { Accent } from './Accent';
import { FlipImage } from './FlipImage';
import { Reveal } from './Reveal';

type HelpSectionProps = {
  eyebrow?: string;
  title: string;
  text?: string;
  label?: string;
  image?: { src: string; alt: string } | null;
  backImage?: { src: string; alt: string } | null;
  site: SiteSetting;
};

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const pin = (
  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
    <g {...stroke}>
      <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </g>
  </svg>
);
const phone = (
  <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
    <path d="M6.6 3h3l1.4 4.2-2 1.5a12 12 0 0 0 5.7 5.7l1.5-2L21 13.8v3A3.2 3.2 0 0 1 17.8 20C10.2 20 4 13.8 4 6.2A3.2 3.2 0 0 1 6.6 3Z" />
  </svg>
);
const mail = (
  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
    <g {...stroke}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </g>
  </svg>
);
const headset = (
  <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
    <g {...stroke}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="2" />
      <rect x="17" y="14" width="4" height="6" rx="2" />
      <path d="M19 20c0 1.5-2 2-5 2" />
    </g>
  </svg>
);

type RowProps = { href: string; icon: ReactNode; title: string; children: ReactNode; aside?: string; external?: boolean };

function Row({ href, icon, title, children, aside, external = false }: RowProps) {
  const className =
    'group flex items-center gap-4 rounded-xl border border-line bg-white px-4 py-3.5 shadow-[0_6px_20px_rgba(20,32,46,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(20,32,46,0.12)]';
  const body = (
    <>
      <span className="grid size-12 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block font-bold text-navy-950">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{children}</span>
      </span>
      {aside && <span className="hidden shrink-0 border-l border-line pl-4 text-xs text-muted sm:block">{aside}</span>}
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-500 transition group-hover:bg-brand-500 group-hover:text-white">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </span>
    </>
  );

  if (external) return <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{body}</a>;
  if (href.startsWith('/')) return <Link href={href} className={className}>{body}</Link>;
  return <a href={href} className={className}>{body}</a>;
}

/** "Need help?" block: a call to action on the left, tappable contact rows on the right. */
export function HelpSection({ eyebrow, title, text, label, image, backImage, site }: HelpSectionProps) {
  const tel = site.phone?.replace(/[^+\d]/g, '');

  return (
    <section className="py-8">
      <div className="container-page grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
        <Reveal className="grid items-center gap-6 xl:grid-cols-[auto_1fr]">
          {image && <FlipImage image={image} backImage={backImage ?? { src: '/home/range-led.png', alt: 'LED bulb' }} />}
          <div>
            {eyebrow && (
              <p className="flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-brand-500">
                <span className="h-px w-8 bg-brand-500/50" aria-hidden="true" />
                {eyebrow}
                <span className="h-px w-8 bg-brand-500/50" aria-hidden="true" />
              </p>
            )}
            <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-navy-950 sm:text-4xl">
              <Accent text={title} />
            </h2>
            {text && <p className="mt-4 max-w-md text-muted">{text}</p>}
            {label && (
              <Link href="/contact-us" className="btn-primary mt-6">
                {label}
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </Link>
            )}
          </div>
        </Reveal>

        <Reveal delay={150}>
        <ul className="space-y-3">
          {site.addresses?.map((address) => (
            <li key={address.id}>
              <Row href={`https://www.google.com/maps?q=${encodeURIComponent(address.text)}`} icon={pin} title="Address" external>
                {address.text}
              </Row>
            </li>
          ))}
          {site.phone && (
            <li>
              <Row href={`tel:${tel}`} icon={phone} title="Phone" aside={site.officeHours}>
                {site.phone}
              </Row>
            </li>
          )}
          {site.email && (
            <li>
              <Row href={`mailto:${site.email}`} icon={mail} title="Email">
                {site.email}
              </Row>
            </li>
          )}
          <li>
            <Row href="/contact-us" icon={headset} title="Contact Us">
              Feel free to reach out to us
            </Row>
          </li>
        </ul>
        </Reveal>
      </div>
    </section>
  );
}
