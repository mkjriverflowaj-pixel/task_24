'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

export type CoverItem = { id: number | string; label: string; href?: string; src?: string; alt?: string };

const mod = (n: number, m: number) => ((n % m) + m) % m;

/**
 * Coverflow carousel. One continuous position drives every card, so it can be dragged with the
 * pointer, flicked with momentum, and always settles smoothly on a card. Transforms are written
 * straight to the DOM in a requestAnimationFrame loop (no React re-render per frame).
 */
export function CoverFlow({ items, label, autoplay = true, seconds = 3.8 }: { items: CoverItem[]; label: string; autoplay?: boolean; seconds?: number }) {
  const auto = useRef({ on: autoplay, ms: seconds * 1000 });
  auto.current = { on: autoplay, ms: seconds * 1000 };
  const count = items.length;
  const router = useRouter();
  const [active, setActive] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const st = useRef({
    target: 0, // where we are heading (in card units, may be fractional while dragging)
    cur: 0, // what is drawn
    dragging: false,
    startX: 0,
    startTarget: 0,
    lastX: 0,
    lastT: 0,
    vel: 0,
    moved: false,
    hover: false,
    lastAuto: 0,
    width: 1100,
    reduced: false,
    shown: -1,
  });

  const snapTo = useCallback((i: number) => {
    // choose the nearest equivalent of i around the loop
    const s = st.current;
    const base = Math.round(s.target);
    const d = mod(i - base + count / 2, count) - count / 2;
    s.target = base + d;
  }, [count]);

  const step = useCallback((dir: number) => {
    st.current.target = Math.round(st.current.target) + dir;
    st.current.lastAuto = performance.now();
  }, []);

  useEffect(() => {
    const s = st.current;
    s.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => (s.width = el.clientWidth));
    ro.observe(el);
    s.width = el.clientWidth;
    s.lastAuto = performance.now();

    let raf = 0;
    let last = performance.now();
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!s.dragging && !s.hover && !s.reduced && auto.current.on && now - s.lastAuto > auto.current.ms) {
        s.target = Math.round(s.target) + 1;
        s.lastAuto = now;
      }
      // critically-damped-ish ease toward the target: smooth, never jumpy
      const k = 1 - Math.exp(-dt * (s.dragging ? 28 : 7));
      s.cur += (s.target - s.cur) * k;
      if (Math.abs(s.target - s.cur) < 0.0005) s.cur = s.target;

      const w = s.width;
      const cardW = w < 640 ? Math.min(w * 0.64, 290) : Math.max(250, Math.min(340, w * 0.27));
      const cardH = cardW * 1.2;
      const gap = (w < 640 ? 0.62 : 0.74) * cardW;
      el.style.height = `${cardH + 40}px`;

      for (let i = 0; i < count; i++) {
        const c = cards.current[i];
        if (!c) continue;
        const off = mod(i - s.cur + count / 2, count) - count / 2; // signed, fractional
        const a = Math.abs(off);
        const sign = Math.sign(off);
        const m = Math.min(a, 1); // 0 at centre -> 1 at first neighbour
        // spacing: first neighbour at 1 gap, further ones bunch up behind
        const x = sign * (a <= 1 ? a * gap : gap + (a - 1) * gap * 0.78);
        const tilt = -sign * Math.min(a, 2) * 13;
        const scale = 1 - Math.min(a, 2) * 0.07;
        const z = -Math.min(a, 3) * 70;
        const op = a >= 2.6 ? 0 : a <= 1 ? 1 - m * 0.2 : Math.max(0, 0.8 - (a - 1) * 0.5);
        c.style.width = `${cardW}px`;
        c.style.height = `${cardH}px`;
        c.style.marginLeft = `${-cardW / 2}px`;
        c.style.opacity = String(op);
        c.style.zIndex = String(100 - Math.round(a * 10));
        c.style.transform = `translate3d(${x}px,0,${z}px) rotateY(${tilt}deg) scale(${scale})`;
        c.style.pointerEvents = a > 2.6 ? 'none' : 'auto';
        // front card turns white and glows; neighbours go glassy
        c.style.setProperty('--front', String(1 - m));
      }

      const idx = mod(Math.round(s.cur), count);
      if (idx !== s.shown) {
        s.shown = idx;
        setActive(idx);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [count]);

  const unit = () => {
    const w = st.current.width;
    return (w < 640 ? 0.62 : 0.74) * (w < 640 ? Math.min(w * 0.64, 290) : Math.max(250, Math.min(340, w * 0.27)));
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') step(1);
        if (e.key === 'ArrowLeft') step(-1);
      }}
      onMouseEnter={() => (st.current.hover = true)}
      onMouseLeave={() => (st.current.hover = false)}
      onFocus={() => (st.current.hover = true)}
      onBlur={() => (st.current.hover = false)}
      className="select-none outline-none"
    >
      <div
        ref={stage}
        className="relative mx-auto w-full cursor-grab touch-pan-y active:cursor-grabbing"
        style={{ perspective: 1600, height: 380 }}
        onPointerDown={(e) => {
          const s = st.current;
          s.dragging = true;
          s.moved = false;
          s.startX = s.lastX = e.clientX;
          s.startTarget = s.target = s.cur;
          s.lastT = performance.now();
          s.vel = 0;
        }}
        onPointerMove={(e) => {
          const s = st.current;
          if (!s.dragging) return;
          const dx = e.clientX - s.startX;
          if (Math.abs(dx) > 6 && !s.moved) {
            s.moved = true;
            // keep following the pointer outside the stage, but only once it is a real drag
            // (capturing on press would redirect the click away from the card)
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {}
          }
          const now = performance.now();
          const dt = Math.max(1, now - s.lastT);
          s.vel = (0.8 * s.vel) + 0.2 * ((e.clientX - s.lastX) / dt); // px per ms
          s.lastX = e.clientX;
          s.lastT = now;
          s.target = s.startTarget - dx / unit();
        }}
        onPointerUp={() => {
          const s = st.current;
          if (!s.dragging) return;
          s.dragging = false;
          // flick: carry the release velocity a little further, then settle on a card
          const carry = (-s.vel * 280) / unit();
          s.target = Math.round(s.target + Math.max(-2.5, Math.min(2.5, carry)));
          s.lastAuto = performance.now();
        }}
        onPointerCancel={() => {
          const s = st.current;
          s.dragging = false;
          s.target = Math.round(s.target);
        }}
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            ref={(el) => {
              cards.current[i] = el;
            }}
            type="button"
            aria-label={i === active ? item.label : `Show ${item.label}`}
            aria-current={i === active}
            onClick={() => {
              const s = st.current;
              if (s.moved) return;
              s.lastAuto = performance.now();
              if (i === mod(Math.round(s.target), count)) {
                if (item.href) router.push(item.href);
              } else {
                snapTo(i);
              }
            }}
            className="coverflow-card absolute left-1/2 top-3 block rounded-[1.4rem] p-3 text-left will-change-transform"
            style={{ opacity: 0 }}
          >
            <div className="relative overflow-hidden rounded-[1.1rem] bg-[#e4dfe0]" style={{ height: 'calc(100% - 3.9rem)' }}>
              {item.src && <Image src={item.src} alt="" fill loading="eager" sizes="340px" draggable={false} className="pointer-events-none object-cover" />}
              <span className="absolute left-3 top-3 grid h-7 min-w-7 place-items-center rounded-full bg-white/95 px-2 text-[11px] font-bold text-brand-500 shadow">
                {String(i + 1).padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-3 px-3 pt-4 text-sm font-semibold text-[#14202e]">
              <span className="coverflow-line h-0.5 shrink-0 bg-brand-500" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-center gap-4">
        <button type="button" onClick={() => step(-1)} aria-label="Previous" className="grid size-9 place-items-center rounded-full border border-brand-500/30 text-brand-500 transition hover:bg-brand-500 hover:text-white">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                snapTo(i);
                st.current.lastAuto = performance.now();
              }}
              aria-label={`Go to ${item.label}`}
              className={`h-2 rounded-full transition-all duration-500 ${i === active ? 'w-7 bg-brand-500' : 'w-2 bg-brand-500/25 hover:bg-brand-500/50'}`}
            />
          ))}
        </div>
        <button type="button" onClick={() => step(1)} aria-label="Next" className="grid size-9 place-items-center rounded-full border border-brand-500/30 text-brand-500 transition hover:bg-brand-500 hover:text-white">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
