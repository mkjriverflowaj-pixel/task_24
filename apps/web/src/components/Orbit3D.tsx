'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Accent } from './Accent';

export type OrbitItem = { id: string; title: string; tag?: string | null; text?: string | null; src: string; alt: string; href: string };

/** Panel colours (top-left to bottom-right), all in the Safonix red / graphite / warm family. */
const PANELS: [string, string][] = [
  ['#ff5a3c', '#a3121a'],
  ['#2a2e3d', '#0e1018'],
  ['#d93b34', '#5a0f16'],
  ['#ff8a3d', '#b4441a'],
  ['#7a8394', '#3a4150'],
  ['#8e1a28', '#2a0b11'],
  ['#e7c06a', '#9a6c1a'],
  ['#3a4150', '#14161f'],
];

const wrap180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

/**
 * Ring of product panels. It always rests with one card facing you; every 4 seconds it turns to the next (paused while the
 * pointer is over it or you are dragging). Drag or flick to spin and it settles on the nearest card; arrows, dots and a click
 * on a side card bring that card to the front; a click on the front card opens it. Only the faces turned toward you are drawn,
 * so nothing shows mirrored. The ring leans with the page scroll.
 */
export function Orbit3D({
  eyebrow,
  title,
  items,
  autoplay = true,
  seconds = 4,
  turnSeconds = 2.3,
}: {
  eyebrow?: string | null;
  title?: string | null;
  hint?: string | null;
  items: OrbitItem[];
  /** Move to the next card by itself (Strapi: Animation Settings → Home). */
  autoplay?: boolean;
  /** Seconds between automatic turns. */
  seconds?: number;
  /** Seconds one turn takes to settle. */
  turnSeconds?: number;
}) {
  const auto = useRef({ on: autoplay, ms: seconds * 1000, rate: 3 / Math.max(0.3, turnSeconds) });
  auto.current = { on: autoplay, ms: seconds * 1000, rate: 3 / Math.max(0.3, turnSeconds) };
  const router = useRouter();
  const count = items.length;
  const step = 360 / count;
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef({ down: false, moved: 0, lastX: 0, id: -1 });
  const s = useRef({ rot: 0, target: 0, hover: false, lastAuto: 0, active: 0 });
  const [active, setActive] = useState(0);

  // Card i faces front when rot = -i * step.
  const goTo = useCallback(
    (index: number) => {
      const st = s.current;
      const want = -(((index % count) + count) % count) * step;
      st.target += wrap180(want - st.target);
      st.lastAuto = performance.now();
    },
    [count, step],
  );
  const move = useCallback(
    (dir: number) => {
      const st = s.current;
      st.target = Math.round(st.target / step) * step - dir * step;
      st.lastAuto = performance.now();
    },
    [step],
  );

  useEffect(() => {
    const stageEl = stage.current;
    const ringEl = ring.current;
    const sec = section.current;
    if (!stageEl || !ringEl || !sec) return;
    const st = s.current;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let radius = 380;
    const layout = () => {
      // The whole ring scales with the screen: wide screens get bigger panels and a wider circle, so the width is used.
      const vw = window.innerWidth;
      const pw = Math.max(vw < 600 ? 230 : 280, Math.min(440, vw * 0.185));
      const ph = pw * 1.47;
      // Never closer than the panels need to stand side by side without overlapping.
      const needed = (pw / 2 / Math.tan(Math.PI / count)) * 1.3;
      radius = needed; // a clear gap of about a quarter of a card between neighbours
      ringEl.style.width = `${pw}px`;
      ringEl.style.height = `${ph}px`;
      ringEl.style.fontSize = `${(pw / 240) * 16}px`;
      stageEl.style.height = `${ph + 70}px`;
      stageEl.style.perspective = `${Math.max(1600, radius * 3.6)}px`;
    };
    layout();
    window.addEventListener('resize', layout);

    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) st.lastAuto = performance.now();
    });
    io.observe(stageEl);

    const enter = () => (st.hover = true);
    const leave = () => {
      st.hover = false;
      st.lastAuto = performance.now();
    };
    stageEl.addEventListener('pointerenter', enter);
    stageEl.addEventListener('pointerleave', leave);

    let vel = 0; // degrees per pointer event, smoothed
    const onDown = (event: PointerEvent) => {
      drag.current = { down: true, moved: 0, lastX: event.clientX, id: event.pointerId };
      vel = 0;
    };
    const onMove = (event: PointerEvent) => {
      const d = drag.current;
      if (!d.down) return;
      const dx = event.clientX - d.lastX;
      d.lastX = event.clientX;
      d.moved += Math.abs(dx);
      // Only start capturing once it is clearly a drag, so a plain click still reaches the panel.
      if (d.moved > 6 && !stageEl.hasPointerCapture(d.id)) stageEl.setPointerCapture(d.id);
      vel = vel * 0.6 + dx * 0.25 * 0.4;
      st.rot += dx * 0.25;
    };
    const onUp = () => {
      if (!drag.current.down) return;
      drag.current.down = false;
      // Flick carries a little further, then it settles on the nearest card.
      st.target = Math.round((st.rot + vel * 14) / step) * step;
      st.lastAuto = performance.now();
    };
    stageEl.addEventListener('pointerdown', onDown);
    stageEl.addEventListener('pointermove', onMove);
    stageEl.addEventListener('pointerup', onUp);
    stageEl.addEventListener('pointercancel', onUp);

    let frame = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (visible) {
        if (drag.current.down) {
          st.target = st.rot;
        } else {
          if (!still && auto.current.on && !st.hover && now - st.lastAuto > auto.current.ms) {
            st.target = Math.round(st.target / step) * step - step;
            st.lastAuto = now;
          }
          // Ease toward the target card: quick at first, gentle as it lands.
          st.rot += (st.target - st.rot) * (1 - Math.exp(-dt * auto.current.rate));
          if (Math.abs(st.target - st.rot) < 0.02) st.rot = st.target;
        }
        // Tilt follows the page scroll: leaning back as the section enters, upright as it leaves.
        const box = sec.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight - box.top) / (window.innerHeight + box.height)));
        const tilt = -14 + p * 18;
        // The lean would drop the front cards by radius * sin(tilt); lift them back so the front card stays centred under the text.
        const leanFix = radius * Math.sin((tilt * Math.PI) / 180);
        ringEl.style.transform = `translateY(${leanFix.toFixed(1)}px) translateZ(${-radius}px) rotateX(${tilt.toFixed(2)}deg) rotateY(${st.rot.toFixed(2)}deg)`;
        panels.current.forEach((panel, i) => {
          if (!panel) return;
          const a = wrap180(i * step + st.rot);
          const k = (Math.cos((a * Math.PI) / 180) + 1) / 2; // 1 = facing you
          const lift = Math.pow(k, 4); // the card in front grows a little and the rest recede
          panel.style.transform = `rotateY(${i * step}deg) translateZ(${radius + lift * 40}px) scale(${(0.9 + 0.12 * lift).toFixed(3)})`;
          panel.style.opacity = (0.3 + 0.7 * k).toFixed(2);
          panel.style.filter = `brightness(${(0.55 + 0.55 * k).toFixed(2)})`;
        });
        const idx = ((Math.round(-st.rot / step) % count) + count) % count;
        if (idx !== st.active) {
          st.active = idx;
          setActive(idx);
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', layout);
      io.disconnect();
      stageEl.removeEventListener('pointerenter', enter);
      stageEl.removeEventListener('pointerleave', leave);
      stageEl.removeEventListener('pointerdown', onDown);
      stageEl.removeEventListener('pointermove', onMove);
      stageEl.removeEventListener('pointerup', onUp);
      stageEl.removeEventListener('pointercancel', onUp);
    };
  }, [count, step]);

  const arrow = 'grid size-10 place-items-center rounded-full border border-white/25 text-white transition hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

  return (
    <section
      id="collections"
      ref={section}
      className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,#6c151e_0%,#3a0b12_42%,#13050a_100%)] py-16 text-white sm:py-20"
      aria-label="3D product explorer"
    >
      <div className="container-page relative text-center">
        {eyebrow && (
          <p className="inline-flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.14em] text-[#ff4b52]">
            <span className="h-0.5 w-8 bg-gradient-to-r from-[#e3262d] to-[#ff7a2f]" aria-hidden="true" />
            {eyebrow}
            <span className="h-0.5 w-8 bg-gradient-to-r from-[#e3262d] to-[#ff7a2f]" aria-hidden="true" />
          </p>
        )}
        {title && (
          <h2 className="font-display mx-auto mt-4 max-w-[16ch] text-4xl font-bold leading-[0.98] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            <Accent text={title} className="text-[#ff4b52]" />
          </h2>
        )}
        <p className="mx-auto mt-5 max-w-[56ch] text-lg text-[#dcc0c3]">Drag the ring, use the arrows, or click a card: the front card opens its range.</p>
      </div>

      <div ref={stage} className="ring-stage relative mt-0 grid h-[35rem] cursor-grab touch-pan-y select-none place-items-center active:cursor-grabbing" style={{ perspective: '1600px' }} aria-label="Rotating carousel of products">
        <div className="ring-floor" aria-hidden="true" />
        <div ref={ring} className="relative h-[22rem] w-[15rem] text-base" style={{ transformStyle: 'preserve-3d' }}>
          {items.map((item, index) => {
            const [from, to] = PANELS[index % PANELS.length];
            return (
              <div
                key={item.id}
                ref={(node) => {
                  panels.current[index] = node;
                }}
                role="link"
                tabIndex={0}
                aria-label={index === active ? `Open ${item.title}` : `Show ${item.title}`}
                onClick={() => {
                  if (drag.current.moved > 6) return;
                  if (index === s.current.active) router.push(item.href);
                  else goTo(index);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    if (index === s.current.active) router.push(item.href);
                    else goTo(index);
                  }
                  if (event.key === 'ArrowRight') move(1);
                  if (event.key === 'ArrowLeft') move(-1);
                }}
                className="ring-panel"
                style={{ background: `linear-gradient(155deg, ${from}, ${to})` }}
              >
                <div>
                  <h3 className="font-display text-[1.5em] font-bold leading-tight tracking-[-0.02em]">{item.title}</h3>
                  {item.tag && <small className="mt-1 block text-[0.875em] opacity-80">{item.tag}</small>}
                </div>
                <div className="relative mx-auto my-2 w-full flex-1">
                  <Image src={item.src} alt={item.alt} fill sizes="260px" draggable={false} className="object-contain drop-shadow-[0_16px_18px_rgba(0,0,0,0.45)]" />
                </div>
                <small className="text-[0.875em] opacity-80">{item.text ?? 'Explore the range'}</small>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-center gap-5">
        <button type="button" className={arrow} onClick={() => move(-1)} aria-label="Previous product">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>
        <div className="flex items-center gap-2" role="tablist" aria-label="Choose a product">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={item.title}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === active ? 'w-7 bg-[#ff4b52]' : 'w-2 bg-white/30 hover:bg-white/60'}`}
            />
          ))}
        </div>
        <button type="button" className={arrow} onClick={() => move(1)} aria-label="Next product">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </section>
  );
}
