'use client';

import { useEffect, useRef, useState, type ElementType, type ReactNode } from 'react';

type RevealProps = {
  children: ReactNode;
  /** Wait this many ms after entering view, so neighbouring items can arrive one after another. */
  delay?: number;
  className?: string;
  as?: 'div' | 'li' | 'ol' | 'section' | 'article';
  /** 3D entrance: '3d' tilts up from below, '3d-left' / '3d-right' swing in from the sides, '3d-flip' drops from the top, '3d-zoom' comes forward. */
  variant?: '3d' | '3d-left' | '3d-right' | '3d-flip' | '3d-zoom';
};

/**
 * Fades its content up the first time it scrolls into view. Content that is already on screen when the page
 * loads (or for people who prefer reduced motion) is simply shown, so nothing is ever hidden without a way back.
 */
export function Reveal({ children, delay = 0, className = '', as = 'div', variant }: RevealProps) {
  const Tag = as as ElementType;
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState<'visible' | 'hidden' | 'shown'>('visible');

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (element.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    setState('hidden');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setState('shown');
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const motion = state === 'hidden' ? 'reveal-hidden' : state === 'shown' ? 'reveal-shown' : '';

  return (
    <Tag ref={ref} className={`${motion} ${variant ? `reveal-3d reveal-${variant} ` : ''}${className}`} style={state === 'shown' ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Tag>
  );
}
