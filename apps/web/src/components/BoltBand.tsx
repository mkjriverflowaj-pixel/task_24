'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { ArrowRight } from './icons';

type Pt = [number, number];

function bolt(x1: number, y1: number, x2: number, y2: number, spread: number): Pt[] {
  if (spread < 3) return [[x1, y1], [x2, y2]];
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread;
  return bolt(x1, y1, mx, my, spread / 2).concat(bolt(mx, my, x2, y2, spread / 2).slice(1));
}

/**
 * Dark call-to-action band with lightning striking behind a glitching headline (click it for an extra strike). The headline grows
 * out of the dark as it scrolls in. Text and button come from the banner fields in Strapi.
 */
export function BoltBand({ title, text, label, href = '/contact-us' }: { title: string; text?: string | null; label?: string | null; href?: string }) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const sec = section.current;
    const cv = canvas.current;
    const head = heading.current;
    const ctx = cv?.getContext('2d');
    if (!sec || !cv || !ctx || !head) return;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let w = 0;
    let h = 0;
    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      w = cv.clientWidth;
      h = cv.clientHeight;
      cv.width = w * d;
      cv.height = h * d;
      ctx.setTransform(d, 0, 0, d, 0, 0);
    };
    size();
    window.addEventListener('resize', size);
    let bolts: { pts: Pt[]; life: number }[] = [];
    const strike = (x?: number) => {
      const sx = x ?? Math.random() * w;
      bolts.push({ pts: bolt(sx, 0, sx + (Math.random() - 0.5) * 300, h * (0.5 + Math.random() * 0.5), 220), life: 1 });
    };
    const onDown = (event: PointerEvent) => strike(event.clientX - cv.getBoundingClientRect().left);
    sec.addEventListener('pointerdown', onDown);
    let visible = false;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(sec);

    let next = 0;
    let frame = 0;
    const loop = (t: number) => {
      if (visible) {
        ctx.clearRect(0, 0, w, h);
        if (!still && t > next) {
          strike();
          next = t + 900 + Math.random() * 1800;
        }
        bolts = bolts.filter((b) => (b.life -= 0.035) > 0);
        for (const b of bolts) {
          ctx.globalAlpha = b.life * (Math.random() > 0.2 ? 1 : 0.3);
          ctx.strokeStyle = '#ff4b52';
          ctx.shadowColor = '#ff4b52';
          ctx.shadowBlur = 18;
          ctx.lineWidth = 2;
          ctx.beginPath();
          b.pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])));
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // The headline grows from 60% to full size as the band scrolls to the middle of the screen.
        if (!still) {
          const r = sec.getBoundingClientRect();
          const p = Math.min(1, Math.max(0, (window.innerHeight - r.top) / (window.innerHeight * 0.5 + r.height * 0.5)));
          head.style.transform = `scale(${(0.6 + 0.4 * p).toFixed(3)})`;
          head.style.opacity = String(0.2 + 0.8 * p);
        }
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', size);
      sec.removeEventListener('pointerdown', onDown);
      io.disconnect();
    };
  }, []);

  return (
    <section ref={section} className="relative overflow-hidden bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,#6c151e_0%,#3a0b12_42%,#13050a_100%)] py-9 text-center text-white sm:py-12">
      <canvas ref={canvas} className="pointer-events-none absolute inset-0 size-full" aria-hidden="true" />
      <div className="container-page relative z-10">
        <h2 ref={heading} className="glitch text-3xl font-extrabold leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl" data-text={title}>
          {title}
        </h2>
        {text && <p className="mx-auto mt-3 max-w-xl text-base text-white/75">{text}</p>}
        {label && (
          <div className="mt-5">
            <Link href={href} className="btn-primary">
              {label}
              <ArrowRight />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
