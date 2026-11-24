import type { Metadata } from 'next';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { ContactForm } from '@/components/ContactForm';
import { LocationTabs } from '@/components/LocationTabs';
import { Reveal } from '@/components/Reveal';
import { ScrollProgress } from '@/components/ScrollProgress';
import { SectionHeading } from '@/components/SectionHeading';
import { SocialLinks } from '@/components/SocialLinks';
import { Accent } from '@/components/Accent';
import { FaqAccordion } from '@/components/FaqAccordion';
import { getContactPage, getFaqs, getSiteSetting, mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact Safonix India for quality electrical products and solutions. Reach our Jaipur office for product inquiries, support, and business assistance.',
};

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const icons = {
  pin: (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <g {...stroke}>
        <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </g>
    </svg>
  ),
  factory: (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <g {...stroke}>
        <path d="M3 21V10l6 3V10l6 3V6h4v15z" />
        <path d="M7 17h2M12 17h2M17 17h0" />
      </g>
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" className="size-6" fill="currentColor" aria-hidden="true">
      <path d="M6.6 3h3l1.4 4.2-2 1.5a12 12 0 0 0 5.7 5.7l1.5-2L21 13.8v3A3.2 3.2 0 0 1 17.8 20C10.2 20 4 13.8 4 6.2A3.2 3.2 0 0 1 6.6 3Z" />
    </svg>
  ),
  mail: (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <g {...stroke}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3.5 7 8.5 6 8.5-6" />
      </g>
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <g {...stroke}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </g>
    </svg>
  ),
};

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function External() {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

type RowProps = {
  icon: ReactNode;
  tag: string;
  title: string;
  children?: ReactNode;
  action?: { href: string; label: string; external?: boolean };
  /** Small red text link shown under the details. */
  link?: { href: string; label: string; external?: boolean };
};

/** One contact point as its own compact card: icon, red label, title, details, optional link and a round arrow button. */
function ContactRow({ icon, tag, title, children, action, link }: RowProps) {
  return (
    <article className="group flex w-full items-center gap-4 border-b border-line px-1 py-4 transition duration-300 hover:translate-x-1">
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-500 transition duration-300 group-hover:-rotate-6 group-hover:scale-110 group-hover:bg-brand-500 group-hover:text-white [&>svg]:size-5">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-500">{tag}</p>
        <h3 className="text-[15px] font-bold leading-snug text-navy-950">{title}</h3>
        {children && <div className="mt-0.5 break-words text-[13px] leading-snug text-muted">{children}</div>}
        {link && (
          <a
            href={link.href}
            {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand-500 transition hover:gap-2"
          >
            {link.label}
            <Arrow />
          </a>
        )}
      </div>
      {action && (
        <a
          href={action.href}
          {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          aria-label={action.label}
          title={action.label}
          className="grid size-8 shrink-0 place-items-center rounded-full border border-brand-500/30 text-brand-500 transition duration-300 hover:bg-brand-500 hover:text-white group-hover:translate-x-0.5"
        >
          {action.external ? <External /> : <Arrow />}
        </a>
      )}
    </article>
  );
}

export default async function ContactPage() {
  const [contact, site, allFaqs] = await Promise.all([getContactPage(), getSiteSetting(), getFaqs()]);
  const faqs = allFaqs.filter((faq) => faq.onContactPage);
  const heroImage = mediaUrl(contact.heroImage);
  const addresses = site.addresses ?? [];
  const main = addresses[0];
  const tel = site.phone?.replace(/[^+\d]/g, '');

  return (
    <>
      <ScrollProgress />
      <section className="relative overflow-hidden bg-[#f6f5f4]">
        {heroImage && (
          <div className="hero-in absolute inset-y-0 right-0 hidden w-[58%] [animation-delay:200ms] [mask-image:linear-gradient(to_right,transparent_0%,black_45%)] lg:block">
            <Image src={heroImage} alt={contact.heroImage?.alternativeText ?? ''} fill priority sizes="60vw" className="object-cover object-center" />
          </div>
        )}
        <div className="container-page relative py-7 lg:py-[41px]">
          {contact.eyebrow && <p className="hero-in text-xs font-bold uppercase tracking-[0.2em] text-brand-500">{contact.eyebrow}</p>}
          <h1 className="hero-in mt-2 text-3xl font-bold tracking-tight text-navy-950 [animation-delay:100ms] sm:text-4xl">{contact.title}</h1>
          {contact.subtitle && <p className="hero-in mt-2 max-w-md text-base leading-snug text-navy-900 [animation-delay:200ms]">{contact.subtitle}</p>}
          <ul className="hero-in mt-4 flex flex-wrap gap-3 [animation-delay:300ms]">
            {site.officeHours && (
              <li className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="text-brand-500 [&>svg]:size-4">{icons.clock}</span>
                {site.officeHours}
              </li>
            )}
            {addresses.length > 0 && (
              <li className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-navy-950 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <span className="text-brand-500 [&>svg]:size-4">{icons.pin}</span>
                {addresses.map((address) => address.label).filter(Boolean).join(' & ')}
              </li>
            )}
          </ul>
        </div>
        {heroImage && (
          <div className="relative h-32 lg:hidden">
            <Image src={heroImage} alt="" fill sizes="100vw" className="object-cover object-center" />
          </div>
        )}
      </section>

      <section className="py-12">
        <div className="container-page">
          <Reveal>
            <SectionHeading title={contact.sectionTitle ?? ''} subtitle={contact.sectionSubtitle} />
          </Reveal>
          <div className="mt-10 grid items-stretch gap-6 lg:grid-cols-[minmax(0,28.8rem)_minmax(0,40rem)] lg:justify-center lg:gap-14 xl:gap-x-[118px]">
            <div className="flex flex-col gap-3.5">
              {addresses.map((address, index) => (
                <Reveal key={address.id} delay={index * 100} className="flex flex-1">
                  <ContactRow
                    icon={index === 0 ? icons.pin : icons.factory}
                    tag="Address"
                    title={address.label ?? 'Address'}
                    action={{ href: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address.text)}`, label: 'Get Directions', external: true }}
                    link={{ href: `https://www.google.com/maps?q=${encodeURIComponent(address.text)}`, label: 'View on map', external: true }}
                  >
                    {address.text}
                  </ContactRow>
                </Reveal>
              ))}
              {site.phone && (
                <Reveal delay={addresses.length * 100} className="flex flex-1">
                  <ContactRow icon={icons.phone} tag="Call Us" title={site.phone} action={{ href: `tel:${tel}`, label: 'Call Now' }}>
                    {site.officeHours}
                  </ContactRow>
                </Reveal>
              )}
              {site.email && (
                <Reveal delay={(addresses.length + 1) * 100} className="flex flex-1">
                  <ContactRow icon={icons.mail} tag="Email Us" title={site.email} action={{ href: `mailto:${site.email}`, label: 'Write Email' }} />
                </Reveal>
              )}
              {(site.facebookUrl || site.instagramUrl || site.xUrl) && (
                <Reveal delay={(addresses.length + 2) * 100} className="flex flex-1">
                  <div className="flex w-full items-center justify-between gap-3 px-1 py-4">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-500">Stay connected</p>
                      <h3 className="text-[15px] font-bold leading-snug text-navy-950">Follow Us</h3>
                    </div>
                    <SocialLinks site={site} />
                  </div>
                </Reveal>
              )}
            </div>

            <Reveal delay={150} className="h-full">
              <div className="group/card relative h-full overflow-hidden rounded-3xl bg-white p-6 shadow-[0_14px_40px_rgba(20,32,46,0.12)] ring-1 ring-black/5 transition duration-300 hover:shadow-[0_20px_50px_rgba(20,32,46,0.16)] sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 size-52 rounded-full bg-gradient-to-br from-[#fbd5da] to-transparent transition duration-700 group-hover/card:scale-125" aria-hidden="true" />
                <div className="relative">
                  <h2 className="text-2xl font-bold tracking-tight text-navy-950">Send us a message</h2>
                  <span className="heading-rule mt-2 block h-0.5 w-12 bg-brand-500" aria-hidden="true" />
                  <p className="mb-6 mt-3 text-sm text-muted">Fill in the form and our team will get back to you.</p>
                  <ContactForm />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {main && (
        <Reveal as="section" className="pb-14">
          <div className="container-page">
            <LocationTabs
              title={contact.mapTitle ?? 'Our Locations'}
              hours={site.officeHours}
              phone={site.phone}
              places={addresses.map((address, index) => ({
                label: address.label ?? 'Address',
                text: address.text,
                mapQuery: index === 0 && contact.mapCoordinates ? contact.mapCoordinates : address.text,
              }))}
            />
          </div>
        </Reveal>
      )}
      {faqs.length > 0 && (
        <section className="bg-gradient-to-b from-white to-[#fff6f7] pb-14 pt-6">
          <div className="container-page">
            <Reveal>
              {contact.faqEyebrow && <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">{contact.faqEyebrow}</p>}
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
                <Accent text={contact.faqTitle ?? 'Frequently Asked Questions'} />
              </h2>
              <span className="heading-rule mt-4 block h-0.5 w-14 rounded bg-brand-500" aria-hidden="true" />
              {contact.faqSubtitle && <p className="mt-3 max-w-xl text-muted">{contact.faqSubtitle}</p>}
            </Reveal>
            <Reveal delay={100} className="mt-8">
              <FaqAccordion variant="wide" items={faqs.map((faq) => ({ id: faq.documentId, question: faq.question, answer: faq.answer }))} />
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
