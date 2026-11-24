'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

/** Header link: red when its page is open, with an underline that slides in (and grows on hover). */
export function NavLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`nav-link relative py-2 transition-colors duration-200 ${active ? 'text-brand-500' : 'hover:text-brand-500'} ${className}`}
    >
      {children}
      <span
        className={`absolute inset-x-0 bottom-0 h-0.5 origin-left rounded-full bg-brand-500 transition-transform duration-300 ease-out ${active ? 'scale-x-100' : 'scale-x-0 [.nav-link:hover_&]:scale-x-100'}`}
        aria-hidden="true"
      />
    </Link>
  );
}
