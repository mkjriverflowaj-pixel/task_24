'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { QrSvg, arts } from './qr';
import { reducedMotion, tweenNumber } from './anim';

type Step = { title: string; text: string; icon: ReactNode };

const angles = [-16, 14, -12, 16, -14];
const SECONDS = 6;
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
 * "How it works" in a fixed, compact box: the steps are numbered on the left, the phone in the middle changes screen as the step
 * changes, and the step's title and text sit on the right. It moves on by itself every few seconds (pauses on hover or touch),
 * and any number can be clicked. No scrolling is needed.
 */
export function StepsStage({ steps, perks, downloadUrl }: { steps: Step[]; perks: Step[]; downloadUrl: string }) {
  const [active, setActive] = useState(0);
  const [pts, setPts] = useState(0);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const badge = useRef<HTMLDivElement>(null);
  const total = steps.length;

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const go = useCallback((i: number) => setActive(((i % total) + total) % total), [total]);

  // auto-advance; the key on the progress bar restarts it for each step
  useEffect(() => {
    if (paused || !inView || reducedMotion()) return;
    const id = window.setTimeout(() => go(active + 1), SECONDS * 1000);
    return () => window.clearTimeout(id);
  }, [active, paused, inView, go]);

  useEffect(() => {
    const el = badge.current;
    if (el) {
      el.classList.remove('pop');
      void el.offsetWidth;
      el.classList.add('pop');
    }
    if (active === 4) return tweenNumber(0, 1250, 1600, setPts);
    setPts(0);
  }, [active]);

  const rot = angles[active];
  const scr = (i: number) => `sl-scr ${i === active ? 'on' : i < active ? 'past' : ''} ${i === 3 ? 'dark' : ''}`;
  const step = steps[active];

  return (
    <div ref={box} className="sl-ss" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onTouchStart={() => setPaused(true)}>
      <ol className="sl-ss-nums" aria-label="Steps">
        {steps.map((s, i) => (
          <li key={s.title}>
            <button type="button" onClick={() => go(i)} aria-label={`Step ${i + 1}: ${s.title}`} aria-current={i === active ? 'step' : undefined} className={i === active ? 'on' : i < active ? 'done' : ''}>
              {i + 1}
            </button>
          </li>
        ))}
      </ol>

      <div className="sl-ss-phone" aria-hidden="true">
        <div className="sl-ss-fit" style={{ transformStyle: 'preserve-3d' }}>
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
              Step {active + 1} of {total}
            </div>
          </div>
        </div>
      </div>

      <div className="sl-ss-text" aria-live="polite">
        <div key={active} className="sl-ss-copy">
          <span className="ic">{step.icon}</span>
          <small>Step {active + 1} of {total}</small>
          <h3>{step.title}</h3>
          <p>{step.text}</p>
        </div>
        <div className="sl-ss-bar" aria-hidden="true">
          <i key={`${active}-${paused}`} style={{ animationDuration: `${SECONDS}s`, animationPlayState: paused || !inView ? 'paused' : 'running' }} />
        </div>
        <div className="sl-ss-actions">
          <button type="button" onClick={() => go(active - 1)} aria-label="Previous step" className="sl-ss-arrow">←</button>
          <button type="button" onClick={() => go(active + 1)} aria-label="Next step" className="sl-ss-arrow">→</button>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="btn-primary !py-2.5">Download on Play Store</a>
        </div>
      </div>

      <aside className="sl-ss-perks" aria-label="What you get">
        <p className="sl-ss-ph">What you get</p>
        {perks.map((p) => (
          <div key={p.title} className="sl-ss-perk">
            <span className="ic">{p.icon}</span>
            <div>
              <b>{p.title}</b>
              <span>{p.text}</span>
            </div>
          </div>
        ))}
        <div className="sl-ss-ps">
          <span>Free on</span>
          <b>Google Play</b>
        </div>
      </aside>
    </div>
  );
}
