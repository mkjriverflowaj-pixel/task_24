'use client';

import { useEffect, useRef, useState } from 'react';

const LANGUAGES = [
  { code: 'en', label: 'English', ready: true },
  { code: 'hi', label: 'हिन्दी (Hindi)', ready: false },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)', ready: false },
  { code: 'mr', label: 'मराठी (Marathi)', ready: false },
];

/**
 * "Language: English" menu for the top bar. Only English has content today; the other languages are listed as
 * "Soon" so the control is in place when translations are added.
 */
export function LanguageSwitch() {
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!wrap.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 text-sm font-medium text-white transition hover:text-brand-400"
      >
        Language: English
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c2.600 2.700 3.900 5.700 3.900 9s-1.300 6.300-3.900 9c-2.600-2.700-3.900-5.700-3.900-9S9.400 5.700 12 3Z" />
        </svg>
        <svg viewBox="0 0 24 24" className={`size-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul role="listbox" aria-label="Language" className="absolute right-0 top-full z-50 mt-2 w-52 overflow-hidden rounded-xl border border-line bg-white py-1 text-sm text-navy-950 shadow-[0_18px_44px_rgba(20,32,46,0.22)] dark:bg-[#1c080d]">
          {LANGUAGES.map((language) => (
            <li key={language.code} role="option" aria-selected={language.code === 'en'} aria-disabled={!language.ready}>
              <button
                type="button"
                disabled={!language.ready}
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-between px-4 py-2.5 text-left transition enabled:hover:bg-brand-50 enabled:hover:text-brand-500 disabled:cursor-not-allowed disabled:text-muted"
              >
                {language.label}
                {language.ready ? (
                  <svg viewBox="0 0 24 24" className="size-4 text-brand-500" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m5 12.500 4.500 4.500L19 7.500" />
                  </svg>
                ) : (
                  <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">Soon</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
