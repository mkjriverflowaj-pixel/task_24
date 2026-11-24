'use client';

import { useEffect, useRef } from 'react';
import { Accent } from './Accent';

export type JourneyStep = { id: string; year: string; title: string; description?: string | null };

/**
 * Horizontal story strip: as you scroll down, the cards glide sideways (the page is held in place only for as long as it takes
 * to pass the last card) and each card turns in 3D as it travels across the screen. A meter shows how far along you are.
 * With reduced motion it is an ordinary sideways-scrolling row.
 */
export function HorizontalJourney({ eyebrow, title, items }: { eyebrow?: string | null; title?: string | null; items: JourneyStep[] }) {
  const outer = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);

  useEffect(() => {
    const wrap = outer.current;
    const strip = track.current;
    if (!wrap || !strip) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let smooth = 0;
    let travel = 0;
    // The site header stays on top of the page, so the pinned stage sits just under it and is only as tall as what is left.
    let headerH = 0;
    const measure = () => {
      headerH = Math.round(document.querySelector('header')?.getBoundingClientRect().height ?? 0);
      wrap.style.setProperty('--hh', `${headerH}px`);
      travel = Math.max(0, strip.scrollWidth - window.innerWidth);
      wrap.style.height = `${window.innerHeight - headerH + travel}px`;
    };
    measure();
    window.addEventListener('resize', measure);
    const cards = Array.from(strip.children) as HTMLElement[];
    const loop = () => {
      const r = wrap.getBoundingClientRect();
      const target = travel > 0 ? Math.min(1, Math.max(0, (headerH - r.top) / travel)) : 0;
      smooth += (target - smooth) * 0.12;
      strip.style.transform = `translate3d(${(-smooth * travel).toFixed(1)}px, 0, 0)`;
      if (fill.current) fill.current.style.transform = `scaleX(${smooth.toFixed(3)})`;
      const vw = window.innerWidth;
      cards.forEach((card) => {
        const b = card.getBoundingClientRect();
        const k = Math.max(-1, Math.min(1, (b.left + b.width / 2 - vw / 2) / vw));
        card.style.transform = `perspective(1200px) rotateY(${(-k * 26).toFixed(1)}deg) translateZ(${(-Math.abs(k) * 120).toFixed(0)}px)`;
        card.style.opacity = String(1 - Math.abs(k) * 0.55);
      });
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', measure);
    };
  }, [items]);

  return (
    <div ref={outer} className="relative">
      <section className="journey-stage sticky top-[var(--hh,0px)] flex h-[calc(100svh-var(--hh,0px))] flex-col justify-center gap-0 overflow-hidden pb-[2svh] bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,#6c151e_0%,#3a0b12_42%,#13050a_100%)] text-white" aria-label="Our journey">
        <div className="container-page flex flex-wrap items-end justify-between gap-5">
          <div>
            {eyebrow && (
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.3em] text-brand-400">
                <span className="h-px w-8 bg-brand-500" aria-hidden="true" />
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="mt-1 max-w-xl text-[clamp(1.4rem,4.2svh,2.25rem)] font-extrabold leading-tight tracking-tight">
                <Accent text={title} className="text-brand-400" />
              </h2>
            )}
          </div>
          <div className="w-[min(18rem,60vw)]">
            <small className="text-xs font-semibold text-white/60">Journey progress</small>
            <div className="mt-2 h-1.5 overflow-hidden rounded bg-white/15">
              <i ref={fill} className="block h-full origin-left bg-gradient-to-r from-[#c8161d] via-[#ff7a2f] to-[#ffb199]" style={{ transform: 'scaleX(0)' }} />
            </div>
          </div>
        </div>
        <div ref={track} className="journey-track flex w-max gap-6 px-[max(1rem,calc((100vw-72rem)/2+1rem))] pt-[clamp(0.75rem,3svh,2.5rem)] will-change-transform">
          {items.map((step, index) => (
            <article key={step.id} className="journey-card relative flex min-h-[min(21rem,40svh)] w-[min(22rem,78vw)] flex-none flex-col overflow-hidden rounded-3xl border border-white/15 bg-white/[0.06] p-[clamp(0.9rem,2.4svh,1.75rem)] backdrop-blur-sm">
              <span className="text-xs font-bold tracking-[0.25em] text-brand-400">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-1 text-[clamp(2.2rem,8svh,3.75rem)] font-extrabold leading-none tracking-tight text-transparent [-webkit-text-stroke:1.5px_rgba(255,255,255,0.55)]">{step.year}</p>
              <h3 className="mt-auto pt-[clamp(0.5rem,2.2svh,2rem)] text-[clamp(1.05rem,3svh,1.5rem)] font-bold leading-tight">{step.title}</h3>
              {step.description && <p className="mt-[clamp(0.25rem,1svh,0.5rem)] text-[clamp(0.75rem,1.9svh,0.875rem)] leading-relaxed text-white/70">{step.description}</p>}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
