import Link from 'next/link';
import type { ReactNode } from 'react';
import { getFooter, getLegalPages, getSiteSetting } from '@/lib/strapi';
import { Logo } from './Logo';
import { Reveal } from './Reveal';
import { SocialLinks } from './SocialLinks';

function Heading({ children }: { children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-3 text-xl font-bold text-white">
      <span className="h-0.5 w-8 bg-brand-500" aria-hidden="true" />
      {children}
    </h2>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <li>
      <Link href={href} className="group flex items-center gap-3 text-base text-white/80 transition duration-300 hover:translate-x-1 hover:text-white">
        <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 text-white/50 transition group-hover:text-brand-400" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
        {children}
      </Link>
    </li>
  );
}

export async function Footer() {
  const [site, legalPages, footer] = await Promise.all([getSiteSetting(), getLegalPages(), getFooter()]);

  // Everything here comes from Strapi's Footer; the values after ?? are only what shows if that entry is empty.
  const quickLinks = footer?.quickLinks?.length
    ? footer.quickLinks
    : [
        { id: 1, label: 'Home', url: '/' },
        { id: 2, label: 'Products', url: '/products' },
        { id: 3, label: 'Safonix Smart Link', url: '/#smart-link' },
        { id: 4, label: 'About Us', url: '/about-us' },
        { id: 5, label: 'Contact Us', url: '/contact-us' },
      ];
  const usefulLinks = footer ? (footer.usefulLinks ?? []) : [{ id: 1, label: 'Support', url: '/faqs' }];
  const showLegal = footer?.showLegalPages !== false;

  return (
    <footer className="relative overflow-hidden bg-[#0d0d0e] text-white/80">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500 to-transparent" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 -top-32 size-96 rounded-full bg-brand-500/10 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-40 left-1/4 size-80 rounded-full bg-brand-500/[0.07] blur-3xl" aria-hidden="true" />
      <div className="container-page relative grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-x-0">
        <Reveal className="space-y-5 sm:col-span-2 lg:col-span-1 lg:pr-12">
          <Logo name={site.siteName} onDark />
          <p className="max-w-md text-[17px] font-light leading-8 tracking-wide text-white/80">{footer?.description ?? site.footerText ?? site.tagline}</p>
        </Reveal>

        <Reveal delay={100}>
          <nav aria-label="Quick links" className="lg:h-full lg:border-l lg:border-white/15 lg:px-10">
            <Heading>{footer?.quickLinksTitle ?? 'Quick Links'}</Heading>
            <ul className="mt-6 space-y-4">
              {quickLinks.map((link) => (
                <FooterLink key={link.id} href={link.url}>
                  {link.label}
                </FooterLink>
              ))}
            </ul>
          </nav>
        </Reveal>

        <Reveal delay={200}>
          <nav aria-label="Useful links" className="lg:h-full lg:border-l lg:border-white/15 lg:px-10">
            <Heading>{footer?.usefulLinksTitle ?? 'Useful Links'}</Heading>
            <ul className="mt-6 space-y-4">
              {usefulLinks.map((link) => (
                <FooterLink key={link.id} href={link.url}>
                  {link.label}
                </FooterLink>
              ))}
              {showLegal && legalPages.map((page) => (
                <FooterLink key={page.documentId} href={`/${page.slug}`}>
                  {page.title}
                </FooterLink>
              ))}
            </ul>
          </nav>
        </Reveal>

        <Reveal delay={300} className="space-y-5 lg:border-l lg:border-white/15 lg:pl-10">
          <div>
            <Heading>{footer?.followTitle ?? 'Follow Us'}</Heading>
            <div className="mt-4">
              <SocialLinks site={site} />
            </div>
          </div>
          <div>
            <Heading>{footer?.contactTitle ?? 'Get In Touch'}</Heading>
            <ul className="mt-4 space-y-2.5 text-base">
              {site.phone && (
                <li>
                  <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-3 text-white/80 transition hover:text-white">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-brand-400" fill="currentColor" aria-hidden="true"><path d="M6.6 3h3l1.4 4.2-2 1.5a12 12 0 0 0 5.7 5.7l1.5-2L21 13.8v3A3.2 3.2 0 0 1 17.8 20C10.2 20 4 13.8 4 6.2A3.2 3.2 0 0 1 6.6 3Z" /></svg>
                    {site.phone}
                  </a>
                </li>
              )}
              {site.email && (
                <li>
                  <a href={`mailto:${site.email}`} className="flex items-center gap-3 break-all text-white/80 transition hover:text-white">
                    <svg viewBox="0 0 24 24" className="size-4 shrink-0 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></svg>
                    {site.email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </Reveal>
      </div>

      <div className="relative">
        <div className="h-px w-full bg-brand-500" aria-hidden="true" />
        <svg className="pointer-events-none absolute -left-10 bottom-0 hidden h-24 w-96 opacity-40 md:block" viewBox="0 0 384 96" fill="none" aria-hidden="true">
          <path d="M0 84C70 54 130 96 220 66S340 30 384 46" stroke="#b3202a" strokeWidth="1.2" />
          <path d="M0 92C76 62 136 100 226 74S344 40 384 56" stroke="#8d1520" strokeWidth="1.2" />
          <path d="M0 76C64 46 124 88 214 58S336 22 384 38" stroke="#d93b34" strokeWidth="1" />
        </svg>
        <div className="container-page relative flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="sm:pl-0 md:pl-0">Copyright © {new Date().getFullYear()}{' '}
            <a href={footer?.copyrightUrl ?? 'https://safonixindia.com/'} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-500 hover:opacity-80">{footer?.copyrightName ?? 'Safonix'}</a>
            {footer?.copyrightSuffix ?? '. All Rights Reserved.'}</p>
          {(footer ? footer.creditName : 'Nextdynamix') && (
            <p>{footer?.creditLabel ?? 'Website Design By'}{' '}
              <a href={footer?.creditUrl ?? 'https://nextdynamix.com/'} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-500 hover:opacity-80">{footer?.creditName ?? 'Nextdynamix'}</a>{' '}
              {footer?.creditSuffix ?? 'Tech (OPC) Pvt. Ltd.'}</p>
          )}
        </div>
      </div>
    </footer>
  );
}
