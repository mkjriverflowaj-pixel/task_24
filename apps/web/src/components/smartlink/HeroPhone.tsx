'use client';

import { useEffect, useRef, useState } from 'react';
import { QrSvg } from './qr';
import { reducedMotion, tweenNumber } from './anim';

/** The hero phone: leans toward the pointer, floats, and loops a little "scan, earn, unlock" story with floating chips. */
export function HeroPhone({ story = true, tilt = true }: { story?: boolean; tilt?: boolean }) {
  const stage = useRef<HTMLDivElement>(null);
  const phone = useRef<HTMLDivElement>(null);
  const [pts, setPts] = useState(1240);
  const [bar, setBar] = useState(20);
  const [flash, setFlash] = useState(false);
  const [chips, setChips] = useState([false, false, false]);

  // Pointer lean + float.
  useEffect(() => {
    const el = phone.current;
    const host = stage.current;
    if (!el || !host) return;
    if (reducedMotion() || !tilt) {
      el.style.transform = 'rotateY(-18deg) rotateX(6deg)';
      return;
    }
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(host);
    const move = (e: PointerEvent) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', move);
    let raf = 0;
    const loop = (now: number) => {
      if (visible) {
        cx += (tx - cx) * 0.08;
        cy += (ty - cy) * 0.08;
        const bob = Math.sin(now / 2600 * Math.PI) * -7 - 7;
        el.style.transform = `translateY(${bob.toFixed(1)}px) rotateY(${(-18 + cx * 30).toFixed(2)}deg) rotateX(${(6 - cy * 16).toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener('pointermove', move);
    };
  }, [tilt]);

  // The looping story (about 6 seconds).
  useEffect(() => {
    if (reducedMotion() || !story) {
      setChips([true, true, true]);
      return;
    }
    let alive = true;
    let value = 1240;
    let width = 20;
    let cancel = () => {};
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(() => alive && fn(), ms));
    const cycle = () => {
      at(1300, () => {
        setFlash(true);
        at(120, () => setFlash(false));
      });
      at(1400, () => setChips([true, false, false]));
      at(1900, () => {
        const from = value;
        value += 25;
        cancel = tweenNumber(from, value, 900, setPts);
        setChips([true, true, false]);
      });
      at(2500, () => {
        width = width >= 86 ? 20 : width + 22;
        setBar(width);
      });
      at(2800, () => setChips([true, true, true]));
      at(5200, () => setChips([false, false, false]));
      at(6200, cycle);
    };
    at(1800, cycle);
    return () => {
      alive = false;
      cancel();
      timers.forEach(clearTimeout);
    };
  }, [story]);

  const check = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>;
  const plus = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>;
  const gift = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8v13M3 12h18M12 8c-2-4-6-4-6-1s6 1 6 1 6 2 6-1-4-3-6 1" /></svg>;

  return (
    <div ref={stage} className="sl-stage" aria-hidden="true">
      <span className="sl-blob" />
      <span className="sl-ring" />
      <div className="sl-fit">
        <div ref={phone} className="sl-phone" style={{ transform: 'rotateY(-18deg) rotateX(6deg)' }}>
          <div className="sl-edges">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ transform: `translateZ(${-i}px)` }} />
            ))}
          </div>
          <div className="sl-body">
            <div className="sl-screen">
              <span className="sl-notch" />
              <div className="sl-sbar"><span>9:41</span><span>5G</span></div>
              <div className="sl-app">
                <div className="sl-head"><span className="sl-back">‹</span><b>Scan product code</b></div>
                <div className="sl-scanbox">
                  <QrSvg seed={7} />
                  <span className="sl-laser" />
                  <span className="sl-cn tl" /><span className="sl-cn tr" /><span className="sl-cn bl" /><span className="sl-cn br" />
                  <span className={`sl-flash ${flash ? 'on' : ''}`} />
                </div>
                <div className="sl-hw">
                  <div><small>Wallet balance</small><b>{pts.toLocaleString('en-IN')} pts</b></div>
                  <span className="sl-coin-ic" />
                </div>
                <div className="sl-hbar"><i style={{ width: `${bar}%` }} /></div>
                <small className="sl-hnext">Progress to next reward</small>
                <div className="sl-abtn">Redeem Now</div>
              </div>
            </div>
          </div>
          <div className={`sl-chip c1 ${chips[0] ? 'on' : ''}`}><i>{check}</i>Scan successful</div>
          <div className={`sl-chip c2 ${chips[1] ? 'on' : ''}`}><i>{plus}</i>25 points earned</div>
          <div className={`sl-chip c3 ${chips[2] ? 'on' : ''}`}><i>{gift}</i>Bonus unlocked</div>
        </div>
      </div>
    </div>
  );
}

