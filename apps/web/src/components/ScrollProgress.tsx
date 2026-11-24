'use client';

import { useEffect, useRef } from 'react';

/** Three thin lines at the top of the screen (deep red, red, orange) that fill as you scroll, each a touch ahead of the last. */
export function ScrollProgress() {
  const bars = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      bars.current.forEach((bar, index) => {
        if (bar) bar.style.transform = `scaleX(${Math.min(1, p * (1 + index * 0.04))})`;
      });
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] flex flex-col" aria-hidden="true">
      {['bg-[#c8161d]', 'bg-brand-500', 'bg-[#ff7a2f]'].map((color, index) => (
        <i
          key={color}
          ref={(node) => {
            bars.current[index] = node;
          }}
          className={`block h-[1.5px] origin-left ${color}`}
          style={{ transform: 'scaleX(0)' }}
        />
      ))}
    </div>
  );
}
