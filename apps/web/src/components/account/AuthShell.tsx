import type { ReactNode } from 'react';
import Link from 'next/link';
import { Accent } from '@/components/Accent';
import { Logo } from '@/components/Logo';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const chipClass = 'absolute flex items-center gap-2 rounded-full bg-white py-2 pl-2 pr-4 text-xs font-bold text-navy-950 shadow-[0_12px_28px_rgba(0,0,0,0.25)]';

type Props = {
  eyebrow: string;
  title: string;
  points: string[];
  heading: string;
  subheading: string;
  footer: ReactNode;
  children: ReactNode;
};

/** Split layout used by Login and Register: red brand panel on the left (from large screens), form card on the right. */
export function AuthShell({ eyebrow, title, points, heading, subheading, footer, children }: Props) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#fff4f5] via-white to-[#fff0f2]">
      <div className="pointer-events-none absolute -right-24 -top-28 size-[28rem] rounded-full bg-gradient-to-br from-[#fbd5da] to-transparent" aria-hidden="true" />
      <div className="container-page relative grid items-stretch gap-8 py-8 lg:grid-cols-[1fr_1.1fr] lg:gap-0 lg:py-12">
        {/* Brand panel */}
        <aside className="hero-in relative hidden overflow-hidden rounded-3xl bg-gradient-to-br from-[#e04a4f] via-[#c8222c] to-[#7a0b17] p-10 text-white shadow-[0_24px_50px_rgba(122,11,23,0.35)] lg:block lg:rounded-r-none">
          <div className="pointer-events-none absolute -bottom-24 -right-16 size-80 rounded-full bg-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute -left-20 top-1/3 size-56 rounded-full border-[18px] border-white/10" aria-hidden="true" />
          <div className="pointer-events-none absolute right-10 top-10 size-24 rounded-full border-[10px] border-white/15" aria-hidden="true" />

          <div className="relative flex h-full flex-col">
            <Logo name="Safonix" onDark />
            <p className="mt-12 flex items-center gap-3 text-sm font-bold uppercase tracking-wide text-white/90">
              <span className="h-0.5 w-9 bg-white" aria-hidden="true" />
              {eyebrow}
            </p>
            <h2 className="mt-3 max-w-sm text-4xl font-bold leading-tight tracking-tight">
              <Accent text={title} className="text-[#ffd9dc]" />
            </h2>
            <ul className="mt-8 space-y-4">
              {points.map((point, index) => (
                <li key={point} className="hero-in flex items-start gap-3 text-[15px] text-white/90" style={{ animationDelay: `${300 + index * 120}ms` }}>
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-white/20">
                    <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
                      <path d="m5 12.5 4.5 4.5L19 7.5" {...stroke} strokeWidth={3} />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>

            <div className="relative mt-auto h-40">
              <div className={`${chipClass} left-0 top-2`} style={{ animation: 'float-slow 6s ease-in-out infinite' }}>
                <span className="grid size-7 place-items-center rounded-full bg-brand-500 text-white">
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <g {...stroke}>
                      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" />
                    </g>
                  </svg>
                </span>
                Scan a code
              </div>
              <div className={`${chipClass} left-28 top-14`} style={{ animation: 'float-slow 7s ease-in-out -2s infinite' }}>
                <span className="grid size-7 place-items-center rounded-full bg-brand-500 text-white">
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <g {...stroke}>
                      <circle cx="12" cy="12" r="9" />
                      <path d="m12 7.5 1.4 3 3.1.4-2.3 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.3-2.2 3.1-.4 1.4-3Z" />
                    </g>
                  </svg>
                </span>
                Earn points
              </div>
              <div className={`${chipClass} left-4 top-[6.6rem]`} style={{ animation: 'float-slow 8s ease-in-out -4s infinite' }}>
                <span className="grid size-7 place-items-center rounded-full bg-brand-500 text-white">
                  <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                    <g {...stroke}>
                      <path d="M4 11h16v9H4zM3 7.5h18V11H3zM12 7.5V20" />
                    </g>
                  </svg>
                </span>
                Redeem bonuses
              </div>
            </div>
          </div>
        </aside>

        {/* Form card */}
        <div className="hero-in rounded-3xl border border-line bg-white p-6 shadow-[0_24px_50px_rgba(20,32,46,0.12)] [animation-delay:120ms] sm:p-9 lg:rounded-l-none lg:border-l-0">
          <div className="mx-auto max-w-md">
            <div className="lg:hidden">
              <Logo name="Safonix" />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight text-navy-950 lg:mt-0">{heading}</h1>
            <span className="heading-rule mt-3 block h-0.5 w-14 rounded bg-brand-500" aria-hidden="true" />
            <p className="mt-3 text-[15px] text-muted">{subheading}</p>
            <div className="mt-7">{children}</div>
            <p className="mt-6 text-center text-sm text-muted">{footer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function SwitchLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-bold text-brand-500 transition hover:opacity-80">
      {children}
    </Link>
  );
}
