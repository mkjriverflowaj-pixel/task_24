'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Accent } from './Accent';
import { ArrowRight } from './icons';

export type ValueItem = {
  id: string;
  /** Short name shown beside its dot on the arc. */
  label: string;
  title: string;
  text: string;
  /** Which picture to show on the plate. */
  art: 'promise' | 'quality' | 'safety' | 'care' | 'india';
  /** An uploaded picture; when present it is shown instead of the drawn art. */
  image?: { src: string; alt: string } | null;
};

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

function Rocker() {
  return (
    <span className="grid h-36 w-16 gap-2 rounded-xl bg-[#e8e3e4] p-1.5 shadow-[inset_0_-2px_0_rgba(0,0,0,0.08),0_6px_12px_rgba(0,0,0,0.15)]">
      <i className="rounded-md bg-[#e3262d] shadow-[inset_0_-3px_0_rgba(0,0,0,0.15)]" />
      <i className="mx-auto h-1.5 w-6 self-center rounded bg-[#22a05a]" />
    </span>
  );
}

function Art({ kind, map }: { kind: ValueItem['art']; map?: ReactNode }) {
  if (kind === 'india') return <div className="relative size-full">{map}</div>;
  if (kind === 'promise') return <Image src="/about/our-promise.svg" alt="" width={160} height={160} className="size-48 sm:size-64" />;
  if (kind === 'safety')
    return (
      <div className="flex items-center gap-2">
        <Rocker />
        <Rocker />
        <svg viewBox="0 0 48 56" className="-ml-3 mt-10 h-28 w-24 drop-shadow-[0_8px_10px_rgba(217,59,52,0.4)]" aria-hidden="true">
          <path d="M24 3 6 10v16c0 14 8 23 18 27 10-4 18-13 18-27V10z" fill="#e3262d" />
          <path d="m15 28 7 7 12-14" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    );
  if (kind === 'quality')
    return (
      <svg viewBox="0 0 64 64" className="size-48 text-[#ff4b52] sm:size-64" aria-hidden="true">
        <g {...stroke}>
          <path d="M32 5 10 14v18c0 14 10 23 22 27 12-4 22-13 22-27V14z" />
          <path d="m22 33 8 8 14-16" />
        </g>
      </svg>
    );
  return (
    <svg viewBox="0 0 64 64" className="size-48 text-[#ff4b52] sm:size-64" aria-hidden="true">
      <g {...stroke}>
        <path d="M12 36v-4a20 20 0 0 1 40 0v4" />
        <rect x="8" y="36" width="10" height="16" rx="4" />
        <rect x="46" y="36" width="10" height="16" rx="4" />
        <path d="M51 52c0 5-6 7-14 7" />
      </g>
    </svg>
  );
}

// A quadratic curve bulging to the right; the dots sit along it.
const P0 = [30, 20];
const P1 = [200, 260];
const P2 = [30, 500];
const point = (t: number) => ({
  x: (1 - t) ** 2 * P0[0] + 2 * (1 - t) * t * P1[0] + t ** 2 * P2[0],
  y: (1 - t) ** 2 * P0[1] + 2 * (1 - t) * t * P1[1] + t ** 2 * P2[1],
});

/**
 * "Our Values" as an interactive dial: a tilting 3D plate on the left shows a picture for the value you are on, a curved line of
 * dots beside it lists all the values (click one, or use the arrows), and the title and text change on the right. It moves on by
 * itself every few seconds and pauses while you hover or focus it. All the words come from Strapi.
 */
export function ValuesDial({
  eyebrow,
  title,
  items,
  map,
  cta,
  autoplay = true,
  seconds = 4,
}: {
  autoplay?: boolean;
  seconds?: number;
  eyebrow: string;
  title: string;
  items: ValueItem[];
  map?: ReactNode;
  cta?: { label: string; href: string };
}) {
  const count = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const go = useCallback((index: number) => setActive(((index % count) + count) % count), [count]);

  useEffect(() => {
    if (paused || count < 2 || !autoplay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => setActive((current) => (current + 1) % count), seconds * 1000);
    return () => clearInterval(timer);
  }, [paused, count, autoplay, seconds]);

  // The plate tilts toward the pointer and floats gently.
  useEffect(() => {
    const el = stage.current;
    const card = plate.current;
    if (!el || !card) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let frame = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);
    const onMove = (event: PointerEvent) => {
      const box = el.getBoundingClientRect();
      tx = ((event.clientX - box.left) / box.width - 0.5) * 2;
      ty = ((event.clientY - box.top) / box.height - 0.5) * 2;
    };
    const onLeave = () => {
      tx = 0;
      ty = 0;
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    const loop = (now: number) => {
      if (visible) {
        x += (tx - x) * 0.08;
        y += (ty - y) * 0.08;
        const bob = Math.sin(now / 1500) * 8;
        card.style.transform = `translateY(${bob.toFixed(1)}px) rotateX(${(8 - y * 14).toFixed(1)}deg) rotateY(${(-14 + x * 18).toFixed(1)}deg) rotateZ(${(-6 + x * 3).toFixed(1)}deg)`;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      io.disconnect();
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const current = items[active];
  const dots = items.map((_, i) => point(count === 1 ? 0.5 : i / (count - 1)));

  return (
    <section
      className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_65%_at_30%_40%,#4a0f17_0%,#1d070b_55%,#0d0507_100%)] py-14 text-white sm:py-20"
      aria-label="Our values"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="container-page grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-12">
        {/* The plate and the dial. */}
        <div className="relative">
          <div ref={stage} className="relative mx-auto grid h-[19rem] max-w-md place-items-center sm:h-[24rem] lg:mx-0 lg:h-[30rem] lg:max-w-none lg:w-[62%]" style={{ perspective: '1300px' }}>
            <div className="absolute size-[85%] rounded-full bg-[radial-gradient(circle,rgba(255,75,82,0.35),transparent_65%)] blur-xl" aria-hidden="true" />
            <div className="absolute w-[120%] max-w-[34rem] rounded-full border border-dashed border-white/15 [aspect-ratio:3/1] [transform:rotateX(70deg)]" aria-hidden="true" />
            <div ref={plate} className="relative size-[min(15rem,62vw)] sm:size-[min(19rem,50vw)]" style={{ transformStyle: 'preserve-3d' }}>
              {/* The picture itself, no card behind it. */}
              <div className="absolute inset-[-6%] grid place-items-center drop-shadow-[0_24px_40px_rgba(0,0,0,0.55)]" key={current.id}>
                <div className="values-art grid size-full place-items-center">
                  {current.image ? (
                    <div className="relative size-full">
                      <Image src={current.image.src} alt={current.image.alt} fill sizes="320px" className="object-contain" />
                    </div>
                  ) : (
                    <Art kind={current.art} map={current.art === 'india' ? map : undefined} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Curved list of values (desktop). */}
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[44%] lg:block">
            <svg viewBox="0 0 220 520" className="absolute inset-0 size-full" preserveAspectRatio="none" aria-hidden="true">
              <path d={`M${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" strokeDasharray="3 6" transform="translate(-14 0)" />
              <path d={`M${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} fill="none" stroke="#c8161d" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 6px rgba(255,75,82,0.8))' }} />
            </svg>
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(i)}
                aria-label={item.label}
                aria-current={i === active}
                className="pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-3 text-left"
                style={{ left: `${(dots[i].x / 220) * 100}%`, top: `${(dots[i].y / 520) * 100}%` }}
              >
                <span className={`grid shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${i === active ? 'size-7 border-[#ffc83d] bg-black shadow-[0_0_0_6px_rgba(255,200,61,0.2)]' : 'size-4 border-[#a8821a] bg-[#1d070b]'}`} />
                <span className={`whitespace-nowrap text-sm font-semibold transition ${i === active ? 'text-white' : 'text-white/50 hover:text-white/80'}`}>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Value chips (phones and tablets). */}
          <div className="mt-2 flex flex-wrap justify-center gap-2 lg:hidden">
            {items.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(i)}
                aria-current={i === active}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${i === active ? 'border-[#ffc83d] bg-[#ffc83d]/15 text-white' : 'border-white/20 text-white/60'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* The words. */}
        <div>
          <p className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#ff4b52]">
            <span className="h-0.5 w-7 bg-[#ff4b52]" aria-hidden="true" />
            {eyebrow}
          </p>
          <h2 className="mt-3 text-4xl font-extrabold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            <Accent text={title} className="text-[#ff4b52]" />
          </h2>
          <div key={current.id} className="values-copy mt-6 min-h-[11rem] sm:min-h-[12rem]" aria-live="polite">
            <h3 className="max-w-md text-2xl font-extrabold leading-tight sm:text-3xl">{current.title}</h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/75">{current.text}</p>
          </div>
          <div className="mt-6 flex items-center gap-3">
            <button type="button" onClick={() => go(active - 1)} aria-label="Previous value" className="grid size-11 place-items-center rounded-full border border-white/25 transition hover:bg-white/10">
              <ArrowRight className="size-4 rotate-180" />
            </button>
            <span className="min-w-[4.5rem] text-center text-sm font-bold tabular-nums text-white/80">
              {String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
            </span>
            <button type="button" onClick={() => go(active + 1)} aria-label="Next value" className="grid size-11 place-items-center rounded-full border border-white/25 transition hover:bg-white/10">
              <ArrowRight className="size-4" />
            </button>
          </div>
          {cta && (
            <Link href={cta.href} className="btn-primary mt-7 bg-gradient-to-r from-[#e3262d] to-[#ff7a2f]">
              {cta.label}
              <ArrowRight />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
