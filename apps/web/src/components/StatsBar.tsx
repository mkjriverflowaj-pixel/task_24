import type { SiteSetting } from '@/lib/strapi';
import { CountUp } from './CountUp';

const people = (
  <svg key="people" viewBox="0 0 64 64" className="size-8" fill="currentColor" aria-hidden="true">
    <circle cx="14" cy="22" r="6" />
    <circle cx="50" cy="22" r="6" />
    <circle cx="32" cy="26" r="9" />
    <path d="M2 46c0-8 5-12 12-12 2 0 4 .5 5 1.5-3 3-5 6-5.5 10.5z" />
    <path d="M62 46c0-8-5-12-12-12-2 0-4 .5-5 1.5 3 3 5 6 5.5 10.5z" />
    <path d="M16 56c0-10 7-16 16-16s16 6 16 16z" />
  </svg>
);

const shield = (
  <svg key="shield" viewBox="0 0 48 48" className="size-8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M24 5 38 10v12c0 9-6 16-14 20C16 38 10 31 10 22V10z" />
    <path d="m17 24 5 5 9-11" />
  </svg>
);

const starPath = 'm12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z';
// Five stars along an arc: the middle one highest, the outer ones lower and tilted outwards.
const starSpots = [
  { x: 4, y: 11, rotate: -20 },
  { x: 32, y: 4, rotate: -10 },
  { x: 60, y: 0, rotate: 0 },
  { x: 88, y: 4, rotate: 10 },
  { x: 116, y: 11, rotate: 20 },
];
const stars = (
  <svg key="stars" viewBox="0 0 144 40" className="twinkle h-8 w-28" fill="currentColor" aria-hidden="true">
    {starSpots.map((spot) => (
      <g key={spot.x} transform={`translate(${spot.x} ${spot.y}) rotate(${spot.rotate} 12 12)`}>
        <path d={starPath} />
      </g>
    ))}
  </svg>
);

const icons = [people, shield, stars];

/** Deep red banner with three headline numbers that count up when scrolled into view. */
export function StatsBar({ stats }: { stats: NonNullable<SiteSetting['stats']> }) {
  return (
    <section className="container-page py-3">
      <div className="scroll-turn relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#7a0b17] via-[#a30f1f] to-[#c4202c] px-6 py-5 text-white">
        <div className="pointer-events-none absolute -right-16 -top-28 size-96 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full border border-white/10" aria-hidden="true" />
        <div className="sweep pointer-events-none absolute inset-y-0 left-0 w-1/5 bg-gradient-to-r from-transparent via-white/15 to-transparent" aria-hidden="true" />
        <dl className="relative grid gap-6 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-white/25">
          {stats.map((stat, index) => (
            <div key={stat.id} className="group flex flex-col items-center px-4 text-center transition duration-300 hover:-translate-y-1">
              <span className="stat-spin grid h-8 place-items-center text-white transition duration-300 group-hover:scale-110">{icons[index % icons.length]}</span>
              <dd className="order-1 mt-1 text-4xl font-bold tracking-tight">
                <CountUp value={stat.value} />
                {stat.suffix}
              </dd>
              <dt className="order-2 text-base text-white/95">{stat.label.replace(/\.$/, '')}</dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
