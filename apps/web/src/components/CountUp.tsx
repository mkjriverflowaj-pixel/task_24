'use client';

import { useEffect, useRef, useState } from 'react';

/** Shows the final value on the server, then counts up from 0 the first time it scrolls into view. */
export function CountUp({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [shown, setShown] = useState(value);
  const [done, setDone] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setShown(Math.round(value * progress));
        if (progress < 1) frame = requestAnimationFrame(tick);
        else setDone(true);
      };
      setShown(0);
      frame = requestAnimationFrame(tick);
    }, { threshold: 0.6 });

    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className={done ? 'count-pop' : ''}>
      {shown}
    </span>
  );
}
