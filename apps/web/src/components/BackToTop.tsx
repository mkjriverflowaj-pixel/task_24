'use client';

import { useEffect, useState } from 'react';

const SHOW_AFTER_PX = 300;

/** Red "back to top" button that appears once the page is scrolled down. */
export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > SHOW_AFTER_PX);
      setAtEnd(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-5 right-5 z-50 grid size-11 place-items-center rounded bg-brand-500 text-white shadow-md transition ${atEnd ? 'scale-110' : ''} hover:bg-brand-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
    >
      {atEnd && visible && <span className="end-ring pointer-events-none absolute inset-0 rounded bg-brand-500" aria-hidden="true" />}
      <svg viewBox="0 0 24 24" className="relative size-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m6 15 6-6 6 6" />
      </svg>
    </button>
  );
}
