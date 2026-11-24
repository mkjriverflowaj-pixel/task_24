'use client';

import Image from 'next/image';
import Link from 'next/link';
import { SplitChars } from './SplitChars';

export type HeroStatementProps = {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  image?: { src: string; alt: string } | null;
  secondaryLabel?: string | null;
  secondaryUrl?: string | null;
  scrollHint?: string | null;
};

/** [left %, size px, seconds, delay seconds] for the dust specks drifting up through the spotlights. */
const DUST: [number, number, number, number][] = [
  [12, 3, 9, 0], [22, 2, 12, 2], [31, 4, 10, 5], [44, 2, 13, 1], [52, 3, 11, 6], [61, 2, 9, 3],
  [68, 4, 12, 0.5], [75, 2, 10, 4], [82, 3, 13, 7], [90, 2, 11, 2.5],
];

/**
 * First banner: a huge statement whose letters swing up in 3D, over a perspective grid and a floating
 * product picture on the right. Text and button come from the first
 * hero slide in Strapi; the part of the heading marked with ** is the gradient line.
 */
export function HeroStatement({ eyebrow, heading, subheading, buttonLabel, buttonUrl, image, secondaryLabel, secondaryUrl, scrollHint }: HeroStatementProps) {
  const match = heading.match(/^(.*?)\s*\*\*(.+?)\*\*\s*$/);
  const first = match ? match[1] : heading.replace(/\*\*/g, '');
  const second = match ? match[2] : '';
  // Two lines: the plain words, then the accent line ("Connect with" / "Confidence.").
  const lines: { text: string; accent: boolean; start: number }[] = [];
  const plain = first.trim();
  if (plain) lines.push({ text: plain, accent: false, start: 0 });
  if (second) lines.push({ text: second, accent: true, start: plain.replace(/\s+/g, '').length });

  return (
    <section className="statement relative flex items-center overflow-hidden py-5 lg:py-8" aria-label="Featured">
      <div className="statement-grid" aria-hidden="true" />
      {/* Stage lighting: two sweeping spotlights from the top corners, the lamps they come from, and drifting dust. */}
      <span className="statement-beam l" aria-hidden="true" />
      <span className="statement-beam r" aria-hidden="true" />
      <span className="statement-lamp left-[43.5%]" aria-hidden="true" />
      <span className="statement-lamp right-[8%]" aria-hidden="true" />
      {DUST.map(([left, size, seconds, delay]) => (
        <span key={left} className="statement-dust" style={{ left: `${left}%`, bottom: '6%', width: size, height: size, animationDuration: `${seconds}s`, animationDelay: `${delay}s` }} aria-hidden="true" />
      ))}
      {image && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 flex w-full items-center justify-end max-lg:opacity-25 lg:w-[56%]" aria-hidden="true">
          {/* The podium is tied to the banner's bottom edge (not the picture) so it is always in view. */}
          <div className="absolute inset-y-0 right-0 w-[min(87.4%,49.4rem)]">
            <div className="statement-podium">
              <i className="glow" />
              <i className="t1" />
              <i className="t2" />
              <i className="t3" />
            </div>
          </div>
          <div className="relative aspect-square w-[min(87.4%,49.4rem)]">
            <div className="float-slow absolute inset-0">
              <Image src={image.src} alt="" fill priority sizes="(min-width: 1024px) 50vw, 90vw" className="object-contain drop-shadow-[0_40px_50px_rgba(0,0,0,0.55)]" />
            </div>
          </div>
        </div>
      )}

      {scrollHint && (
        <p className="scroll-hint absolute right-5 top-1/2 z-10 hidden text-xs font-semibold text-muted xl:flex" aria-hidden="true">
          {scrollHint}
          <i />
        </p>
      )}

      <div className="relative z-10 mx-auto w-full px-[clamp(1rem,2.6vw,3rem)]">
        {eyebrow && (
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-400">
            {eyebrow}
          </p>
        )}
        <h1 className="statement-title hero-chars-on mt-5" aria-label={heading.replace(/\*\*/g, '')}>
          {lines.map((line, index) => (
            <span key={line.text} className="block overflow-hidden pb-[0.04em]">
              <SplitChars text={line.accent ? `**${line.text}**` : line.text} accentClass="statement-accent" start={line.start} />
            </span>
          ))}
        </h1>
        <div className="mt-8 flex max-w-[34rem] flex-col gap-6">
          {subheading && <p className="hero-in max-w-md text-base text-white/75 sm:text-lg [animation-delay:500ms]">{subheading}</p>}
          <div className="hero-in flex flex-wrap gap-3 [animation-delay:620ms]">
            {buttonLabel && buttonUrl && (
              <Link href={buttonUrl} className="btn-primary">
                {buttonLabel}
              </Link>
            )}
            {secondaryLabel && (
              <a href={secondaryUrl || '#collections'} className="statement-ghost" data-magnetic>
                <span className="play" aria-hidden="true">
                  <svg viewBox="0 0 24 24" className="ml-0.5 size-3.5" fill="currentColor"><path d="M8 5.500v13a1 1 0 0 0 1.500.9l10.500-6.500a1 1 0 0 0 0-1.700L9.500 4.600A1 1 0 0 0 8 5.500Z" /></svg>
                </span>
                {secondaryLabel}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
