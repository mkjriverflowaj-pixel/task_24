import Link from 'next/link';
import { getMenuCategories, getSiteSetting, type Category } from '@/lib/strapi';
import { LanguageSwitch } from './LanguageSwitch';
import { Logo } from './Logo';
import { MobileNav } from './MobileNav';
import { NavLink } from './NavLink';
import { HeaderActions } from './store/HeaderActions';
import { ThemeSwitch } from './ThemeSwitch';

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/** Sub-categories switched on with "Show in menu" in Strapi, in menu order. */
const menuChildren = (category: Category) =>
  (category.children ?? []).filter((child) => child.showInMenu).sort((a, b) => a.order - b.order);

export async function Header() {
  const [site, categories] = await Promise.all([getSiteSetting(), getMenuCategories()]);

  // One collapsible "Products" group: All Products, then each category with its own sub-items.
  const mobileItems = [
    { href: '/', label: 'Home' },
    {
      href: '/products',
      label: 'Products',
      children: [
        { href: '/products', label: 'All Products' },
        ...categories.map((category) => ({
          href: `/products/${category.slug}`,
          label: category.name,
          children: menuChildren(category).map((child) => ({ href: `/products/${child.slug}`, label: child.name })),
        })),
      ],
    },
    { href: '/about-us', label: 'About Us' },
    { href: '/contact-us', label: 'Contact Us' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 bg-white/60 backdrop-blur-xl backdrop-saturate-150">
      <div className="hidden bg-navy-950/75 text-sm font-medium text-white lg:block">
        <div className="container-page flex items-center justify-between py-2">
          <span className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="size-4 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {site.officeHours}
          </span>
          <span className="flex items-center gap-8">
            {site.phone && (
              <a href={`tel:${site.phone.replace(/[^+\d]/g, '')}`} className="flex items-center gap-2 hover:text-brand-400">
                <svg viewBox="0 0 24 24" className="size-4 text-brand-400" fill="currentColor" aria-hidden="true">
                  <path d="M6.6 3h3l1.4 4.200-2 1.500a12 12 0 0 0 5.700 5.700l1.500-2L21 13.800v3A3.200 3.200 0 0 1 17.800 20C10.200 20 4 13.800 4 6.200A3.200 3.200 0 0 1 6.600 3Z" />
                </svg>
                {site.phone}
              </a>
            )}
            {site.email && (
              <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-brand-400">
                <svg viewBox="0 0 24 24" className="size-4 text-brand-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3.500 7 8.500 6 8.500-6" />
                </svg>
                {site.email}
              </a>
            )}
            <LanguageSwitch />
          </span>
        </div>
      </div>
      <div className="container-page relative flex h-14 items-center justify-between lg:h-16">
        <Logo name={site.siteName} />
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-semibold text-navy-900 lg:flex" aria-label="Main">
          <NavLink href="/">Home</NavLink>
          <div className="group relative flex h-16 items-center">
            <NavLink href="/products" className="flex items-center gap-1">
              Products
              <Chevron className="size-4 transition-transform duration-300 group-hover:rotate-180" />
            </NavLink>
            <ul className="invisible absolute right-0 top-full w-[259px] border border-line bg-white opacity-0 transition group-has-[:focus-visible]:visible group-has-[:focus-visible]:opacity-100 group-hover:visible group-hover:opacity-100">
              {categories.map((category) => {
                const children = menuChildren(category);
                return (
                  <li key={category.documentId} className="group/item border-b border-line last:border-b-0">
                    <Link
                      href={`/products/${category.slug}`}
                      className="flex items-center justify-between gap-3 px-[18px] py-[14px] text-[13.5px] font-normal text-navy-900 hover:text-brand-500"
                    >
                      {category.name}
                      {children.length > 0 && <Chevron className="size-[14px] shrink-0 transition-transform group-hover/item:rotate-180 group-has-[:focus-visible]/item:rotate-180" />}
                    </Link>
                    {children.length > 0 && (
                      <ul className="hidden border-t border-line bg-surface group-hover/item:block group-has-[:focus-visible]/item:block">
                        {children.map((child) => (
                          <li key={child.documentId}>
                            <Link href={`/products/${child.slug}`} className="block py-[9px] pl-7 pr-[18px] text-[12.5px] font-normal text-muted hover:text-brand-500">
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <NavLink href="/about-us">About Us</NavLink>
          <NavLink href="/contact-us">Contact Us</NavLink>
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <HeaderActions />
          <ThemeSwitch />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <HeaderActions compact />
          <ThemeSwitch />
          <MobileNav items={mobileItems} />
        </div>
      </div>
    </header>
  );
}
