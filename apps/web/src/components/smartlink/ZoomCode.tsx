'use client';

import Image from 'next/image';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clamp01, easeIn2, easeInOut2, easeOut3, headerHeight, lerp, reducedMotion } from './anim';
import { qrMatrix } from './qr';

type Pillar = { title: string; text: string; icon: ReactNode };

const TOTAL = 4.65; // length of the scroll timeline, in "beats"
const seg = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

/**
 * "It starts with one code": when this part of the page comes into view it plays by itself (no scrolling needed). A packaging box turns to face you, you fly into its QR code,
 * the code bursts into pieces, and the three pillars (Scan / Earn / Redeem) arrive out of the flash.
 * With reduced motion it is a plain, static section.
 */
export function ZoomCode({ pillars, enabled = true, seconds = 5.3 }: { pillars: Pillar[]; enabled?: boolean; seconds?: number }) {
  const outer = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const qr = useRef<HTMLDivElement>(null);
  const cap1 = useRef<HTMLDivElement>(null);
  const cap2 = useRef<HTMLDivElement>(null);
  const flash = useRef<HTMLDivElement>(null);
  const pillarWrap = useRef<HTMLDivElement>(null);
  const [still, setStill] = useState(false);

  const modules = useMemo(() => {
    const m = qrMatrix(3);
    const list: { x: number; y: number }[] = [];
    m.forEach((row, y) => row.forEach((v, x) => v && list.push({ x, y })));
    return list;
  }, []);

  useEffect(() => {
    if (reducedMotion() || !enabled) {
      setStill(true);
      return;
    }
    const wrap = outer.current;
    if (!wrap) return;
    const cubes = Array.from(qr.current?.children ?? []) as HTMLElement[];
    const cards = Array.from(pillarWrap.current?.children ?? []) as HTMLElement[];

    // Each QR square gets its own flight path; the ones near the centre leave first.
    let s = 7;
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    const flight = modules.map((m) => ({
      z: 150 + rnd() * 750,
      rx: (rnd() - 0.5) * 400,
      ry: (rnd() - 0.5) * 400,
      rank: Math.hypot(m.x - 10, m.y - 10),
    }));
    const maxRank = Math.max(...flight.map((f) => f.rank), 1);

    const measure = () => wrap.style.setProperty('--hh', `${headerHeight()}px`);
    measure();
    window.addEventListener('resize', measure);

    // Time-driven: starts when at least half of the section is on screen, runs once (about 5 seconds), and plays again the
    // next time you come back to it.
    let raf = 0;
    let t = 0;
    let t0 = 0;
    let playing = false;
    let done = false;
    const draw0 = () => draw(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= 0.55 && !playing && !done) {
          playing = true;
          t0 = performance.now();
        } else if (entry.intersectionRatio === 0 && (playing || done)) {
          playing = false;
          done = false;
          t = 0;
          draw0();
        }
      },
      { threshold: [0, 0.55] },
    );
    io.observe(wrap);
    const draw = (t: number) => {
      // box turns to face you, then flies through you
      const turn = easeInOut2(seg(t, 0, 1));
      const fly = easeIn2(seg(t, 1.1, 1.6));
      const z = lerp(-200, 0, turn) + 1080 * fly;
      if (box.current) {
        box.current.style.transform = `translateZ(${z.toFixed(1)}px) rotateY(${(lerp(-38, 0, turn)).toFixed(2)}deg) rotateX(${lerp(16, 0, turn).toFixed(2)}deg)`;
        box.current.style.opacity = t >= 2.62 ? '0' : '1';
      }
      if (cap1.current) {
        const k = easeOut3(seg(t, 0.95, 0.4));
        cap1.current.style.opacity = String(1 - k);
        cap1.current.style.transform = `translateY(${(-50 * k).toFixed(1)}px) scale(${lerp(1, 0.9, k).toFixed(3)})`;
      }
      // the code breaks apart
      cubes.forEach((c, i) => {
        const f = flight[i];
        const start = 1.5 + (f.rank / maxRank) * 0.45;
        const k = easeIn2(seg(t, start, 1));
        c.style.transform = k > 0 ? `translateZ(${(f.z * k).toFixed(0)}px) rotateX(${(f.rx * k).toFixed(0)}deg) rotateY(${(f.ry * k).toFixed(0)}deg)` : '';
        c.style.opacity = String(1 - k);
      });
      // flash, then the next caption and the three pillars
      if (flash.current) {
        const up = seg(t, 2.45, 0.15);
        const down = seg(t, 2.62, 0.4);
        flash.current.style.opacity = String(t < 2.62 ? up : 1 - down);
      }
      if (cap2.current) {
        const k = easeOut3(seg(t, 2.7, 0.8));
        cap2.current.style.opacity = String(k);
        cap2.current.style.transform = `scale(${lerp(2.4, 1, k).toFixed(3)})`;
        cap2.current.style.filter = k >= 1 ? 'none' : `blur(${lerp(12, 0, k).toFixed(1)}px)`;
      }
      cards.forEach((card, i) => {
        const k = easeOut3(seg(t, 2.75 + i * 0.25, 1));
        card.style.opacity = String(k);
        card.style.transform = `translateZ(${lerp(-1000, 0, k).toFixed(0)}px) rotateX(${lerp(30, 0, k).toFixed(1)}deg)`;
      });
    };
    const loop = (now: number) => {
      if (playing) {
        t = Math.min(TOTAL, (now - t0) / ((seconds * 1000) / TOTAL));
        draw(t);
        if (t >= TOTAL) {
          playing = false;
          done = true;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    draw0();
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [modules, enabled, seconds]);

  return (
    <section id="zoom" className={`sl-zoom ${still ? 'sl-zoom-static' : ''}`} aria-label="How rewards work">
      <div ref={outer} className="relative">
        <div className="sl-zoom-stage">
          <div ref={cap1} className="sl-zcap one">
            <div className="sl-kicker c">How rewards work</div>
            <h2 className="sl-h2">
              It starts with <span className="text-brand-500">one code</span>
            </h2>
          </div>
          <div ref={cap2} className="sl-zcap" style={{ opacity: 0 }}>
            <div className="sl-kicker c">Scan. Earn. Redeem.</div>
            <h2 className="sl-h2">
              Every box <span className="text-brand-500">pays you back</span>
            </h2>
          </div>

          <div className="sl-zboxwrap" aria-hidden="true">
            <div ref={box} className="sl-zbox" style={{ transform: 'translateZ(-200px) rotateY(-38deg) rotateX(16deg)' }}>
              <div className="zf back" />
              <div className="zf bottom" />
              <div className="zf left">
                <b>Modular switch</b>
                16A, one way
                <br />
                Safonix India
              </div>
              <div className="zf right"><span>SAFONIX</span></div>
              <div className="zf top" />
              <div className="zf front">
                <div className="zf-band">
                  <span><Image src="/safonix-logo.svg" alt="" width={201} height={55} unoptimized /></span>
                </div>
                <div ref={qr} className="zf-qr">
                  {modules.map((m) => (
                    <i key={`${m.x}-${m.y}`} style={{ gridRow: m.y + 1, gridColumn: m.x + 1 }} />
                  ))}
                </div>
                <div className="zf-foot">Scan with Safonix Smart Link</div>
              </div>
            </div>
          </div>
          <div ref={flash} className="sl-zflash" />

          <div ref={pillarWrap} className="sl-pillars">
            {pillars.map((p) => (
              <article key={p.title} className="sl-zp">
                <span className="ic">{p.icon}</span>
                <h3>{p.title}</h3>
                <p>{p.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
