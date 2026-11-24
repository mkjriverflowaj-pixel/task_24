import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Accent } from '@/components/Accent';
import { CoverFlow } from '@/components/CoverFlow';
import { ArrowRight } from '@/components/icons';
import { Rich } from '@/components/Rich';
import { Reveal } from '@/components/Reveal';
import { ScrollProgress } from '@/components/ScrollProgress';
import { CapabilitiesSection } from '@/components/CapabilitiesSection';
import { LeadershipSection } from '@/components/LeadershipSection';
import { HorizontalJourney } from '@/components/HorizontalJourney';
import { ValuesDial, type ValueItem } from '@/components/ValuesDial';
import { SectionHeading } from '@/components/SectionHeading';
import { getMotion } from '@/lib/motion';
import { getAboutPage, getSiteSetting, mediaUrl } from '@/lib/strapi';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Safonix India is a trusted electrical products manufacturer since 2016, delivering quality wires, cables, LED lighting, and ventilation solutions across India.',
};

// Where each office sits on the India map picture, as a percentage of the picture (left, top).
const officeSpots: Record<string, { x: number; y: number }> = {
  jaipur: { x: 35.3, y: 37.2 },
  vasai: { x: 29, y: 56.8 },
};

function Shield() {
  return (
    <svg viewBox="0 0 96 110" className="shield-pop h-28 w-24 shrink-0 drop-shadow-[0_10px_14px_rgba(122,11,23,0.25)]" aria-hidden="true">
      <path d="M48 4 88 18v34c0 26-16 44-40 54C24 96 8 78 8 52V18z" fill="#d93b34" />
      <path d="M48 4 88 18v34c0 26-16 44-40 54z" fill="#b3202a" />
      <path className="draw-check" d="m30 54 13 13 24-28" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default async function AboutPage() {
  const motion = (await getMotion()).about;
  const [about, site] = await Promise.all([getAboutPage(), getSiteSetting()]);
  const image = mediaUrl(about.image);
  const mapImage = mediaUrl(about.valuesImage);
  const offices = (site.addresses ?? []).flatMap((address) => {
    const key = Object.keys(officeSpots).find((city) => (address.label ?? address.text).toLowerCase().includes(city));
    return key ? [{ name: key, ...officeSpots[key] }] : [];
  });

  // The values dial reads About Page → Value items in Strapi (label, title, text, picture). If that list is empty it falls back
  // to the text that is already elsewhere on the page.
  const leaders = about.leaders ?? [];
  const fromStrapi: ValueItem[] = (about.valueItems ?? []).map((item) => {
    const src = mediaUrl(item.image);
    return { id: String(item.id), label: item.label, title: item.title, text: item.text ?? '', art: item.art ?? 'promise', image: src ? { src, alt: item.image?.alternativeText ?? item.title } : null };
  });
  const derived: ValueItem[] = [
    ...(about.values?.[1] ? [{ id: 'promise', label: 'Our promise', title: about.values[1].title, text: about.values[1].description ?? '', art: 'promise' as const }] : []),
    ...(leaders[1] ? [{ id: 'quality', label: 'Quality first', title: leaders[1].role, text: leaders[1].text ?? '', art: 'quality' as const }] : []),
    ...(about.certificationsSubtitle && about.certificationsText ? [{ id: 'safety', label: 'Safety', title: about.certificationsSubtitle, text: about.certificationsText, art: 'safety' as const }] : []),
    ...(leaders[2] ? [{ id: 'care', label: 'Customer care', title: leaders[2].role, text: leaders[2].text ?? '', art: 'care' as const }] : []),
    ...(about.values?.[0] ? [{ id: 'india', label: 'Made in India', title: about.values[0].title, text: about.values[0].description ?? '', art: 'india' as const }] : []),
  ];
  const valueItems = fromStrapi.length > 0 ? fromStrapi : derived;
  const indiaMap = mapImage ? (
    <div className="relative size-full">
      <Image src={mapImage} alt={about.valuesImage?.alternativeText ?? 'Map of India'} fill sizes="320px" className="object-contain" />
      {offices.map((office) => (
        <span key={office.name} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${office.x}%`, top: `${office.y}%` }}>
          <span className="flex items-center gap-1 whitespace-nowrap rounded-full bg-brand-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-[0_6px_16px_rgba(217,59,52,0.45)]">
            <span className="size-1.5 rounded-full bg-white" />
            {office.name}
          </span>
        </span>
      ))}
    </div>
  ) : undefined;

  const rangeSlides = (about.rangeItems ?? []).map((item) => ({
    id: item.id,
    label: item.label,
    href: item.link ?? undefined,
    src: mediaUrl(item.image) ?? undefined,
    alt: item.image?.alternativeText ?? item.label,
  }));

  return (
    <>
      <ScrollProgress />
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff4f5] via-white to-[#fff0f2]">
        <div className="pointer-events-none absolute -right-24 -top-28 size-[28rem] rounded-full bg-gradient-to-br from-[#fbd5da] to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-32 bottom-0 size-80 rounded-full bg-gradient-to-tr from-[#fde3e6] to-transparent" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-6 py-6 lg:grid-cols-2 lg:gap-10 lg:py-8">
          <div>
            <p className="hero-in flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-navy-950">
              <span className="h-0.5 w-9 bg-brand-500" aria-hidden="true" />
              About Us
            </p>
            <h1 className="hero-in mt-3 max-w-xl text-3xl font-bold leading-tight tracking-tight text-navy-950 [animation-delay:100ms] sm:text-4xl">
              <Accent text={about.heading} />
            </h1>
            <div className="hero-in mt-4 max-w-2xl space-y-3 text-[15px] leading-relaxed text-navy-900 [animation-delay:220ms]">
              {about.intro?.split('\n\n').map((paragraph) => (
                <p key={paragraph}>
                  <Rich text={paragraph} />
                </p>
              ))}
            </div>
            <Link href="/contact-us" className="btn-primary hero-in mt-5 [animation-delay:340ms]">
              Get in touch with us!
              <ArrowRight />
            </Link>
          </div>
          {image && (
            <div className="hero-in relative mx-auto w-full max-w-xl [animation-delay:160ms] lg:ml-auto lg:mr-0">
              <div className="absolute -bottom-5 -left-5 size-36 rounded-full bg-gradient-to-br from-[#e04a4f] to-[#7a0b17]" aria-hidden="true" />
              <div className="absolute -right-3 -top-3 hidden size-16 rounded-full border-[8px] border-[#fbd5da] sm:block" aria-hidden="true" />
              <div className="relative aspect-[3/2] overflow-hidden rounded-3xl shadow-[0_22px_48px_rgba(20,32,46,0.25)]">
                <Image src={image} alt={about.image?.alternativeText ?? ''} fill priority sizes="(min-width: 1024px) 36rem, 100vw" className="object-cover" />
              </div>
            </div>
          )}
        </div>
      </section>

      {rangeSlides.length > 0 && (
        <section className="relative overflow-hidden bg-gradient-to-b from-white via-[#fff6f7] to-white py-10">
          <div className="pointer-events-none absolute -left-24 top-24 size-72 rounded-full bg-gradient-to-br from-[#fbd5da]/70 to-transparent" aria-hidden="true" />
          <div className="pointer-events-none absolute -right-20 bottom-10 size-80 rounded-full bg-gradient-to-tl from-[#fbd5da]/70 to-transparent" aria-hidden="true" />
          <div className="container-page relative">
            <Reveal>
              <SectionHeading eyebrow="OUR PRODUCTS" title={about.rangeTitle ?? ''} subtitle={about.rangeSubtitle} />
            </Reveal>
            <Reveal className="mt-8" delay={120}>
              <CoverFlow label="Product range" items={rangeSlides} autoplay={motion.productSliderAutoplay} seconds={motion.productSliderSeconds} />
            </Reveal>
          </div>
        </section>
      )}

      {about.certifications && about.certifications.length > 0 && (
        <Reveal as="section" className="container-page py-4">
          {/* Fixed background: the photo stays put in the viewport and is revealed through this panel as the page scrolls. */}
          <div className="relative overflow-hidden rounded-3xl bg-[url('/about/quality-bg.jpg')] bg-cover bg-center bg-scroll md:bg-fixed">
            <div className="absolute inset-0 bg-[#fdeaed]/65" aria-hidden="true" />
            <div className="relative grid gap-10 p-8 lg:grid-cols-[1.45fr_1fr] lg:items-center lg:p-10 xl:grid-cols-[1.15fr_1.4fr] xl:p-12">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                <Shield />
                <div>
                  <h2 className="text-3xl font-bold leading-tight tracking-tight text-navy-950 xl:text-4xl">
                    <Accent text={about.certificationsTitle ?? ''} className="block text-brand-500" />
                  </h2>
                  {about.certificationsSubtitle && <p className="mt-3 font-medium text-navy-900">{about.certificationsSubtitle}</p>}
                  {about.certificationsText && <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{about.certificationsText}</p>}
                  {about.certificationsClosing && <p className="mt-3 max-w-md text-sm font-semibold leading-relaxed text-navy-900">{about.certificationsClosing}</p>}
                  <Link href="/contact-us" className="btn-primary mt-5">
                    Get in touch with us!
                    <ArrowRight />
                  </Link>
                </div>
              </div>
              <ul className="grid grid-cols-2 gap-y-8 sm:grid-cols-4 lg:grid-cols-2 lg:gap-y-6 xl:grid-cols-4 xl:divide-x xl:divide-brand-500/20">
                {about.certifications.map((cert) => (
                  <li key={cert.id} className="group flex flex-col items-center px-3 text-center">
                    <Image src={`/about/${cert.name.toLowerCase()}.svg`} alt="" width={100} height={100} className="size-16 transition duration-300 group-hover:scale-110" />
                    <h3 className="mt-2 text-lg font-bold text-navy-950">{cert.name}</h3>
                    {cert.fullName && <p className="mt-1 text-xs leading-snug text-navy-900">({cert.fullName})</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      )}

      {about.journey && about.journey.length > 0 && (
        <HorizontalJourney
          eyebrow={about.journeyEyebrow}
          title={about.journeyTitle}
          items={about.journey.map((step) => ({ id: String(step.id), year: step.year, title: step.title, description: step.description }))}
        />
      )}

      {about.capabilities && about.capabilities.length > 0 && (
        <CapabilitiesSection eyebrow={about.capabilitiesEyebrow} title={about.capabilitiesTitle} text={about.capabilitiesText} items={about.capabilities} />
      )}

      {about.leaders && about.leaders.length > 0 && (
        <LeadershipSection eyebrow={about.leadersEyebrow} title={about.leadersTitle} text={about.leadersText} items={about.leaders} />
      )}

      {valueItems.length > 1 && (
        <ValuesDial
          autoplay={motion.valuesAutoplay}
          seconds={motion.valuesSeconds}
          eyebrow={about.valuesEyebrow ?? 'What we stand for'}
          title={about.valuesTitle ?? 'Our **Values**'}
          items={valueItems}
          map={indiaMap}
          cta={{ label: about.valuesCtaLabel ?? 'Explore Our Products', href: about.valuesCtaUrl ?? '/products' }}
        />
      )}
    </>
  );
}
