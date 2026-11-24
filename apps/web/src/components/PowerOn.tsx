'use client';

import { useEffect, useState } from 'react';

/**
 * Brand intro on every full page load: a voltage counter climbs to 230 V while a bar charges, then the screen splits open like
 * shutters and the page animations start. Skipped for reduced-motion. While it plays, the page's entrance animations wait
 * (html[data-intro="play"] in globals.css).
 */
export function PowerOn() {
  const [phase, setPhase] = useState<'on' | 'open' | 'done'>('on');
  const [value, setValue] = useState(0);

  useEffect(() => {
    const root = document.documentElement;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      root.dataset.intro = 'done';
      setPhase('done');
      return;
    }
    let v = 0;
    let closing: ReturnType<typeof setTimeout> | undefined;
    let removing: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      v = Math.min(100, v + Math.random() * 8 + 4);
      setValue(v);
      if (v >= 100) {
        clearInterval(timer);
        closing = setTimeout(() => {
          setPhase('open');
          root.dataset.intro = 'done';
          removing = setTimeout(() => setPhase('done'), 1200);
        }, 220);
      }
    }, 55);
    return () => {
      clearInterval(timer);
      clearTimeout(closing);
      clearTimeout(removing);
      root.dataset.intro = 'done';
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div className={`poweron ${phase === 'open' ? 'poweron-open' : ''}`} aria-hidden="true">
      <div className="poweron-half poweron-top" />
      <div className="poweron-half poweron-bottom" />
      <div className="poweron-ui">
        <div className="poweron-box">
          <div className="poweron-num">
            {String(Math.round(value * 2.3)).padStart(3, '0')}
            <small>V</small>
          </div>
          <div className="poweron-bar">
            <i style={{ transform: `scaleX(${value / 100})` }} />
          </div>
          <p className="poweron-cap">Charging the line</p>
        </div>
      </div>
    </div>
  );
}
