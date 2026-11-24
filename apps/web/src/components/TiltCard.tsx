'use client';

import { useRef, type ReactNode } from 'react';

/** Card that tilts toward the pointer (3D) while its decorations drift the other way. Mouse only; no effect on touch. */
export function TiltCard({ children, decor }: { children: ReactNode; decor?: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);

  function move(e: React.PointerEvent) {
    if (e.pointerType !== 'mouse' || !wrap.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = wrap.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    wrap.current.style.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    wrap.current.style.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
    wrap.current.style.setProperty('--dx', `${(-x * 22).toFixed(1)}px`);
    wrap.current.style.setProperty('--dy', `${(-y * 22).toFixed(1)}px`);
  }

  function leave() {
    const el = wrap.current;
    if (!el) return;
    ['--rx', '--ry', '--dx', '--dy'].forEach((p) => el.style.setProperty(p, '0'));
  }

  return (
    <div ref={wrap} onPointerMove={move} onPointerLeave={leave} className="tilt-wrap relative mx-auto w-full max-w-xl [perspective:1000px]">
      <div className="tilt-decor pointer-events-none absolute inset-0">{decor}</div>
      <div className="tilt-card relative overflow-hidden rounded-3xl bg-white p-6 shadow-[0_24px_50px_rgba(20,32,46,0.18)]">{children}</div>
    </div>
  );
}
