'use client';

import Image from 'next/image';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { QrSvg, arts } from './qr';
import { headerHeight, reducedMotion, tweenNumber } from './anim';

type Step = { title: string; text: string; icon: ReactNode };

const angles = [-16, 14, -12, 16, -14];
const check = (w = 4) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={w} strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const products = [
  ['sw', 'Modular switch', 'Switches'],
  ['db', 'MCB', 'Protection'],
  ['fan', 'Ventilation fan', 'Fans'],
  ['wire', 'Wire coil', 'Wires & cables'],
] as const;

/**
 * Five steps on the left; a phone stays in view on the right and changes screen (and turns) as each step reaches the middle.
 * A red line fills down the list as you read.
 */
export function StepsShowcase({ steps }: { steps: Step[] }) {
  const [active, setActive] = useState(0);
  const [pts, setPts] = useState(0);
  const list = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLElement>(null);
  const grid = useRef<HTMLDivElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const badge = useRef<HTMLDivElement>(null);

  // Which step is in the middle of the screen.
  useEffect(() => {
    const narrow = window.innerWidth < 900;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: narrow ? '-58% 0px -34% 0px' : '-45% 0px -45% 0px' },
    );
    refs.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Header offset for the sticky phone, and the fill line.
  useEffect(() => {
    const g = grid.current;
    if (!g) return;
    const set = () => g.style.setProperty('--hh', `${headerHeight()}px`);
    set();
    window.addEventListener('resize', set);
    let raf = 0;
    const loop = () => {
      const l = list.current;
      if (l && fill.current) {
        const r = l.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (window.innerHeight * 0.5 - r.top) / Math.max(1, r.height)));
        fill.current.style.transform = `scaleY(${p.toFixed(3)})`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', set);
    };
  }, []);

  useEffect(() => {
    const b = badge.current;
    if (b) {
      b.classList.remove('pop');
      void b.offsetWidth;
      b.classList.add('pop');
    }
    if (active === 4) return tweenNumber(0, 1250, 1600, setPts);
    setPts(0);
  }, [active]);

  const rot = angles[active];
  const scr = (i: number) => `sl-scr ${i === active ? 'on' : i < active ? 'past' : ''} ${i === 3 ? 'dark' : ''}`;

  return (
    <div ref={grid} className="sl-st-grid">
      <div ref={list} className="sl-st-list">
        <span className="sl-st-line">
          <i ref={fill} />
        </span>
        {steps.map((s, i) => (
          <div
            key={s.title}
            ref={(el) => {
              refs.current[i] = el;
            }}
            data-i={i}
            className={`sl-step ${i === active ? 'on' : ''}`}
          >
            <button
              type="button"
              className="sl-num"
              aria-label={`Go to step ${i + 1}`}
              onClick={() => refs.current[i]?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' })}
            >
              {i + 1}
            </button>
            <div className="sl-st-card">
              <span className="ic">{s.icon}</span>
              <small>Step {i + 1}</small>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="sl-st-sticky" aria-hidden="true">
        <div className="sl-st-fit relative" style={{ transformStyle: 'preserve-3d' }}>
          <div className="sl-phone sl-st-phone" style={{ transform: `rotateY(${rot}deg) rotateX(6deg)` }}>
            <div className="sl-edges">
              {Array.from({ length: 12 }, (_, i) => (
                <i key={i} style={{ transform: `translateZ(${-i}px)` }} />
              ))}
            </div>
            <div className="sl-body">
              <div className="sl-screen">
                <span className="sl-notch" />
                <div className={`sl-sbar ${active === 3 ? 'w' : ''}`}>
                  <span>9:41</span>
                  <span>5G</span>
                </div>

                <div className={scr(0)}>
                  <div className="sl-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6">
                      <circle cx="11" cy="11" r="7" />
                      <path d="m20 20-4-4" />
                    </svg>
                    Safonix Smart Link
                  </div>
                  <div className="sl-psapp">
                    <span className="sl-psicon">
                      <Image src="/safonix-logo.svg" alt="" width={201} height={55} unoptimized />
                    </span>
                    <div>
                      <b>Safonix Smart Link</b>
                      <small>Safonix</small>
                      <small className="g">Rewards for dealers and buyers</small>
                    </div>
                  </div>
                  <div className="sl-install">
                    <span className="fill" />
                    <span className="t t1">Install</span>
                    <span className="t t2">Open</span>
                  </div>
                  <div className="sl-shots">
                    <i />
                    <i />
                    <i />
                  </div>
                  <p className="sl-about">
                    <b>About this app</b>Scan Safonix products, earn points and redeem rewards from your wallet.
                  </p>
                </div>

                <div className={scr(1)}>
                  <b className="sl-atitle">Create your account</b>
                  <small className="sl-asub">Choose how you use Safonix</small>
                  <div className="sl-seg">
                    <i className="pill" />
                    <span>Dealer</span>
                    <span>Distributor</span>
                    <span>Electrician</span>
                  </div>
                  <div className="sl-fld"><small>Email</small>name@example.com</div>
                  <div className="sl-fld"><small>Phone number</small>+91 98765 43210</div>
                  <div className="sl-fld focus">
                    <small>Distributor / dealer code</small>
                    <span className="sl-type">SFX-2048-JPR</span>
                  </div>
                  <div className="sl-abtn">Create account</div>
                </div>

                <div className={scr(2)}>
                  <b className="sl-atitle">Products and offers</b>
                  <small className="sl-asub">Latest from Safonix</small>
                  <div className="sl-plist">
                    <span className="sl-hlrow" />
                    {products.map(([k, n, c], i) => (
                      <div key={k} className="sl-prow">
                        <span className="pi">{arts[k]}</span>
                        <div>
                          <b>{n}</b>
                          <small>{c}</small>
                        </div>
                        <span className="ck">{i === 1 ? check(4) : null}</span>
                      </div>
                    ))}
                  </div>
                  <div className="sl-abtn">Continue</div>
                </div>

                <div className={scr(3)}>
                  <b className="sl-atitle">Scan the code</b>
                  <small className="sl-asub">Align the QR code inside the frame</small>
                  <div className="sl-cam">
                    <div className="sl-cam-box">
                      <QrSvg seed={11} />
                    </div>
                    <span className="sl-laser" />
                    <span className="sl-cn tl" />
                    <span className="sl-cn tr" />
                    <span className="sl-cn bl" />
                    <span className="sl-cn br" />
                  </div>
                  <div className="sl-toast">
                    <i>{check(4)}</i>Scan recorded to your account
                  </div>
                </div>

                <div className={scr(4)}>
                  <b className="sl-atitle">Wallet</b>
                  <div className="sl-wcard">
                    <small>Available points</small>
                    <b>{pts.toLocaleString('en-IN')} pts</b>
                  </div>
                  <div className="sl-wlist">
                    <div><span>Scan bonus</span><b>+25</b></div>
                    <div><span>Purchase</span><b>+40</b></div>
                    <div><span>Sales target met</span><b>+100</b></div>
                  </div>
                  <div className="sl-abtn pulse">Redeem Now</div>
                </div>
              </div>
            </div>
            <div ref={badge} className="sl-badge">
              Step {active + 1} of {steps.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
