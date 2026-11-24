'use client';

import { useEffect, useRef, useState } from 'react';
import { burst } from './FxLayer';

/**
 * "Lights on / off": a little wall switch in the header that turns the whole site dark (and back). The room flashes white or
 * black, sparks fly from the switch, and the choice is remembered. The page starts in light mode unless you saved dark.
 */
export function ThemeSwitch({ className = '' }: { className?: string }) {
  const [dark, setDark] = useState(false);
  const flash = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark');
  }, []);

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? 'dark' : 'light';
    try {
      localStorage.setItem('safonix-theme', next ? 'dark' : 'light');
    } catch {
      /* storage blocked: the choice just won't be remembered */
    }
    const box = event.currentTarget.getBoundingClientRect();
    burst(box.left + box.width / 2, box.top + box.height / 2, 40);
    const el = flash.current;
    if (el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.style.background = next ? '#000' : '#fff';
      el.animate([{ opacity: next ? 0.0 : 0.7 }, { opacity: 0 }], { duration: 700, easing: 'ease-out' });
      if (next) el.animate([{ opacity: 0.55 }, { opacity: 0 }], { duration: 600, easing: 'ease-out' });
    }
  }

  return (
    <>
      <button type="button" onClick={toggle} aria-pressed={!dark} aria-label="Switch the lights on or off" className={`lights-switch ${className}`}>
        <span className="lights-plate">
          <span className="lights-rock" />
        </span>
        <span className="hidden xl:inline">{dark ? 'Lights off' : 'Lights on'}</span>
      </button>
      <div ref={flash} className="lights-flash" aria-hidden="true" />
    </>
  );
}
