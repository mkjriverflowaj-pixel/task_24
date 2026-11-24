'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { initialsOf, signOut as endSession, useAccount } from '@/lib/session';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const nav = [
  {
    href: '/account',
    label: 'Overview',
    icon: <path d="M4 13h6V4H4zM14 20h6v-9h-6zM14 4v5h6V4zM4 20h6v-3H4z" />,
  },
  {
    href: '/profile',
    label: 'My profile',
    icon: (
      <>
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
      </>
    ),
  },
  {
    href: '/wishlist',
    label: 'Wishlist',
    icon: <path d="M12 20.5s-7.5-4.5-7.5-10A4.5 4.5 0 0 1 12 7.6a4.5 4.5 0 0 1 7.5 2.9c0 5.5-7.5 10-7.5 10Z" />,
  },
];

/** Page frame for Account and Profile: greeting banner, a side menu (tabs on phones) and the page content. */
export function AccountShell({ title, children }: { title: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signedIn } = useAccount();

  async function signOut() {
    await endSession();
    router.push('/login');
  }

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-[#fff4f5] via-white to-[#fff0f2]">
        <div className="pointer-events-none absolute -right-24 -top-28 size-[24rem] rounded-full bg-gradient-to-br from-[#fbd5da] to-transparent" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 bottom-0 size-64 rounded-full bg-gradient-to-tr from-[#fde3e6] to-transparent" aria-hidden="true" />
        <div className="container-page relative py-8 lg:py-10">
          <nav aria-label="Breadcrumb" className="hero-in text-sm text-muted">
            <ol className="flex items-center gap-2">
              <li><Link href="/" className="transition hover:text-brand-500">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="font-medium text-navy-950">{title}</li>
            </ol>
          </nav>
          <div className={`mt-5 flex flex-wrap items-center gap-5 transition-opacity duration-500 ${ready ? 'opacity-100' : 'opacity-0'}`}>
            <span className="hero-in relative grid size-20 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e04a4f] to-[#7a0b17] text-2xl font-extrabold text-white shadow-[0_14px_30px_rgba(122,11,23,0.35)] ring-4 ring-white">
              {initialsOf(user.name)}
              <span className="absolute bottom-0.5 right-0.5 size-4 rounded-full border-2 border-white bg-emerald-500" aria-hidden="true" />
            </span>
            <div className="hero-in [animation-delay:100ms]">
              <p className="text-sm font-bold uppercase tracking-wide text-brand-500">{title === 'My profile' ? 'Account settings' : 'Welcome back'}</p>
              <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">{user.name || 'Your account'}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                {signedIn && <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">{user.accountType}</span>}
                {user.email && <span>{user.email}</span>}
                {user.email && user.joined && <span className="hidden sm:inline" aria-hidden="true">·</span>}
                {user.joined && <span>Member since {user.joined}</span>}
                {!signedIn && <span>Sign in or register to see your details here.</span>}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-10">
        <div className="container-page grid gap-6 lg:grid-cols-[15rem_1fr] lg:gap-8">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <nav aria-label="Account" className="flex gap-2 overflow-x-auto rounded-2xl border border-line bg-white p-2 shadow-[0_6px_20px_rgba(20,32,46,0.06)] lg:flex-col lg:overflow-visible">
              {nav.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition duration-200 ${active ? 'bg-brand-500 text-white shadow-[0_8px_18px_rgba(217,59,52,0.3)]' : 'text-navy-900 hover:bg-brand-50 hover:text-brand-500'}`}
                  >
                    <svg viewBox="0 0 24 24" className="size-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true">
                      <g {...stroke}>{item.icon}</g>
                    </svg>
                    {item.label}
                  </Link>
                );
              })}
              <button
                type="button"
                onClick={signOut}
                className="group flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-muted transition duration-200 hover:bg-brand-50 hover:text-brand-500 lg:mt-1 lg:border-t lg:border-line lg:pt-4"
              >
                <svg viewBox="0 0 24 24" className="size-5 transition-transform duration-300 group-hover:translate-x-0.5" aria-hidden="true">
                  <g {...stroke}>
                    <path d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4M15 8l4 4-4 4M19 12H9" />
                  </g>
                </svg>
                Sign out
              </button>
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </section>
    </>
  );
}
