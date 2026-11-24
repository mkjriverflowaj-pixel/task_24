'use client';

import { useEffect, useRef } from 'react';

type Spark = { x: number; y: number; vx: number; vy: number; life: number; color: string; w: number };

const COLORS = ['#ff8a3d', '#e3262d', '#ffb199'];

/** Anything can ask for a burst of sparks: window.dispatchEvent(new CustomEvent('safonix-burst', { detail: { x, y, n } })). */
export function burst(x: number, y: number, n = 24) {
  window.dispatchEvent(new CustomEvent('safonix-burst', { detail: { x, y, n } }));
}

/**
 * Site-wide motion layer: sparks fly off wherever you click, a soft glowing trail follows the pointer, and buttons lean slightly toward the pointer (magnetic). The normal cursor is left alone.
 * Everything is off for reduced-motion, and the trail is for mouse pointers only.
 */
export function FxLayer() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = canvas.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let sparks: Spark[] = [];
    let w = 0;
    let h = 0;
    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      cv.width = w * d;
      cv.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    size();
    window.addEventListener('resize', size);

    const add = (x: number, y: number, n: number) => {
      for (let i = 0; i < n; i += 1) {
        const a = Math.random() * Math.PI * 2;
        const s = 2 + Math.random() * 7;
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, life: 1, color: COLORS[i % COLORS.length], w: 1 + Math.random() * 2 });
      }
    };
    const onBurst = (event: Event) => {
      const { x, y, n } = (event as CustomEvent<{ x: number; y: number; n?: number }>).detail;
      add(x, y, n ?? 24);
    };
    const onDown = (event: PointerEvent) => add(event.clientX, event.clientY, 14);
    window.addEventListener('safonix-burst', onBurst);
    window.addEventListener('pointerdown', onDown);

    let mx = w / 2;
    let my = h / 2;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      mx = event.clientX;
      my = event.clientY;
      if (Math.random() < 0.35) sparks.push({ x: mx, y: my, vx: (Math.random() - 0.5) * 1.4, vy: (Math.random() - 0.5) * 1.4, life: 0.6, color: '#e3262d', w: 1.2 });
      // Magnetic buttons: lean toward the pointer while it is over them.
      const target = (event.target as Element | null)?.closest?.<HTMLElement>('.btn-primary, [data-magnetic]');
      if (target) {
        const box = target.getBoundingClientRect();
        const x = event.clientX - box.left;
        const y = event.clientY - box.top;
        target.style.transform = `translate(${((x - box.width / 2) * 0.22).toFixed(1)}px, ${((y - box.height / 2) * 0.3).toFixed(1)}px)`;
      }
    };
    const onOut = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest?.<HTMLElement>('.btn-primary, [data-magnetic]');
      if (target && !target.contains(event.relatedTarget as Node | null)) {
        target.style.transition = 'transform 500ms cubic-bezier(0.3, 1.6, 0.5, 1)';
        target.style.transform = '';
        setTimeout(() => {
          target.style.transition = '';
        }, 520);
      }
    };
    const onOver = (event: PointerEvent) => {
    };
    if (fine) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerout', onOut);
      window.addEventListener('pointerover', onOver);
    }

    let frame = 0;
    const loop = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const p = sparks[i];
        const ox = p.x;
        const oy = p.y;
        p.vy += 0.18;
        p.vx *= 0.98;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.022;
        if (p.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.lineWidth = p.w;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      sparks = [];
      window.removeEventListener('resize', size);
      window.removeEventListener('safonix-burst', onBurst);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerout', onOut);
      window.removeEventListener('pointerover', onOver);
    };
  }, []);

  return (
    <>
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[70] size-full" aria-hidden="true" />
    </>
  );
}
