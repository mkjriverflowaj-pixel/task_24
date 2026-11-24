'use client';

import { useState } from 'react';

type Place = { label: string; text: string; mapQuery: string };

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

/** "Our Locations": one tab per address; the details card and the map change together. */
export function LocationTabs({ places, hours, phone, title }: { places: Place[]; hours?: string; phone?: string; title: string }) {
  const [active, setActive] = useState(0);
  const place = places[active] ?? places[0];
  const tel = phone?.replace(/[^+\d]/g, '');
  if (!place) return null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">{title}</h2>
          <span className="mt-2 block h-0.5 w-14 bg-brand-500" aria-hidden="true" />
        </div>
        {places.length > 1 && (
          <div role="tablist" aria-label="Locations" className="flex gap-1 rounded-full border border-line bg-surface p-1">
            {places.map((item, index) => (
              <button
                key={item.label + index}
                type="button"
                role="tab"
                aria-selected={index === active}
                onClick={() => setActive(index)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition duration-300 sm:text-sm ${index === active ? 'bg-brand-500 text-white shadow-md' : 'text-navy-900 hover:text-brand-500'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div key={active} className="hero-in mt-6 grid gap-5 lg:justify-center lg:grid-cols-[21.6rem_calc((100%_-_21.25rem)_*_0.9)]">
        <div className="flex flex-col rounded-2xl border border-line bg-surface p-5">
          <p className="inline-flex items-center gap-2 self-start rounded bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-500">
            <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
              <g {...stroke}>
                <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </g>
            </svg>
            {active === 0 ? 'Main office' : 'Location'}
          </p>
          <h3 className="mt-3 text-xl font-bold text-navy-950">{place.label}</h3>
          <p className="mt-2 text-[15px] leading-relaxed text-navy-900">{place.text}</p>
          <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm text-navy-900">
            {tel && phone && (
              <li>
                <a href={`tel:${tel}`} className="flex items-center gap-2.5 transition hover:text-brand-500">
                  <svg viewBox="0 0 24 24" className="size-4 text-brand-500" fill="currentColor" aria-hidden="true">
                    <path d="M6.6 3h3l1.4 4.2-2 1.5a12 12 0 0 0 5.7 5.7l1.5-2L21 13.8v3A3.2 3.2 0 0 1 17.8 20C10.2 20 4 13.8 4 6.2A3.2 3.2 0 0 1 6.6 3Z" />
                  </svg>
                  {phone}
                </a>
              </li>
            )}
            {hours && (
              <li className="flex items-center gap-2.5">
                <svg viewBox="0 0 24 24" className="size-4 text-brand-500" aria-hidden="true">
                  <g {...stroke}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </g>
                </svg>
                {hours}
              </li>
            )}
          </ul>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(place.text)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary group mt-6 w-full lg:mt-auto"
          >
            Get Directions
            <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>
        <iframe
          title={`Map showing ${place.text}`}
          src={`https://www.google.com/maps?q=${encodeURIComponent(place.mapQuery)}&z=13&output=embed`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-72 w-full rounded-2xl border-0 lg:h-full lg:min-h-[20rem]"
        />
      </div>
    </div>
  );
}
