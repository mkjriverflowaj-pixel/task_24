'use client';

import { useState } from 'react';
import { SectionIcon } from './SectionIcon';

export type FaqItem = { id: string; question: string; answer: string; tag?: string | null; icon?: string | null };

/**
 * FAQ cards: an icon tile, a small label, the question and a round arrow. Opening one question closes the others.
 */
export function FaqAccordion({ items, variant = 'card' }: { items: FaqItem[]; variant?: 'card' | 'wide' }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (variant === 'wide') {
    // Long, plain rows that span the full width: question on the left, a "+" on the right that turns into "×" when open.
    return (
      <div className="space-y-3">
        {items.map((item) => {
          const open = item.id === openId;
          return (
            <div
              key={item.id}
              className={`rounded-[1.75rem] border bg-white transition duration-300 ${
                open ? 'border-brand-500/40 shadow-[0_12px_28px_rgba(20,32,46,0.1)]' : 'border-line shadow-[0_3px_12px_rgba(20,32,46,0.05)] hover:border-brand-500/30 hover:shadow-[0_8px_20px_rgba(20,32,46,0.09)]'
              }`}
            >
              <h3>
                <button
                  type="button"
                  id={`faq-${item.id}`}
                  aria-expanded={open}
                  aria-controls={`faq-panel-${item.id}`}
                  onClick={() => setOpenId(open ? null : item.id)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-8"
                >
                  <span className={`text-[15px] font-bold transition-colors duration-300 sm:text-base ${open ? 'text-brand-500' : 'text-navy-950'}`}>{item.question}</span>
                  <svg viewBox="0 0 24 24" className={`size-5 shrink-0 transition duration-300 ${open ? 'rotate-45 text-brand-500' : 'text-muted'}`} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </h3>
              <div
                id={`faq-panel-${item.id}`}
                role="region"
                aria-labelledby={`faq-${item.id}`}
                inert={!open}
                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
              >
                <div className="overflow-hidden">
                  <p className="px-6 pb-6 text-[14.5px] leading-relaxed text-muted sm:px-8">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        const open = item.id === openId;
        return (
          <div
            key={item.id}
            className={`group rounded-2xl border bg-white transition duration-300 ${
              open ? 'border-brand-500/40 shadow-[0_14px_32px_rgba(20,32,46,0.12)]' : 'border-line shadow-[0_4px_16px_rgba(20,32,46,0.06)] hover:-translate-y-0.5 hover:border-brand-500/30 hover:shadow-[0_10px_24px_rgba(20,32,46,0.1)]'
            }`}
          >
            <h2>
              <button
                type="button"
                id={`faq-${item.id}`}
                aria-expanded={open}
                aria-controls={`faq-panel-${item.id}`}
                onClick={() => setOpenId(open ? null : item.id)}
                className="flex w-full items-center gap-4 px-4 py-4 text-left sm:gap-5 sm:px-6 sm:py-5"
              >
                <span
                  className={`grid size-11 shrink-0 place-items-center rounded-xl transition duration-300 ${
                    open ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-500 group-hover:scale-105'
                  }`}
                >
                  <SectionIcon name={item.icon} className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  {item.tag && (
                    <span className="mb-1 inline-block rounded bg-surface px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-navy-900/70">{item.tag}</span>
                  )}
                  <span className="block text-base font-bold leading-snug text-navy-950 sm:text-[17px]">{item.question}</span>
                </span>
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-full transition duration-300 ${
                    open ? 'rotate-180 bg-brand-500 text-white' : 'bg-surface text-navy-900 group-hover:bg-brand-50 group-hover:text-brand-500'
                  }`}
                  aria-hidden="true"
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </button>
            </h2>
            <div
              id={`faq-panel-${item.id}`}
              role="region"
              aria-labelledby={`faq-${item.id}`}
              inert={!open}
              className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <p className="mx-4 mb-4 border-l-2 border-brand-500 pl-4 text-[14.5px] leading-relaxed text-muted sm:mx-6 sm:mb-5 sm:pl-5 sm:ml-[4.75rem]">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
