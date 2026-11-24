'use client';

import { useEffect, useRef } from 'react';

/**
 * Plays a Lottie animation (.json) uploaded in Strapi. The player library loads only when this component is used. With
 * reduced motion it shows the first frame and stays still.
 */
export function LottiePlayer({ src, label, loop = true, className = '' }: { src: string; label?: string; loop?: boolean; className?: string }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let anim: { destroy: () => void } | null = null;
    let gone = false;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    import('lottie-web/build/player/lottie_light').then((mod) => {
      if (gone) return;
      const lottie = ((mod as unknown as { default?: unknown }).default ?? mod) as { loadAnimation: (o: object) => { destroy: () => void } };
      anim = lottie.loadAnimation({ container: el, renderer: 'svg', loop, autoplay: !still, path: src });
    });
    return () => {
      gone = true;
      anim?.destroy();
    };
  }, [src, loop]);

  return <div ref={box} className={className} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} />;
}
