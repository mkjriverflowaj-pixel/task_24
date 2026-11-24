'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { SplitChars } from './SplitChars';
import { ArrowRight } from './icons';

export type HeroSlide = {
  eyebrow?: string | null;
  heading: string;
  subheading?: string | null;
  buttonLabel?: string | null;
  buttonUrl?: string | null;
  theme: 'red' | 'black' | 'warm';
  image?: { src: string; alt: string } | null;
};


/** Both themes are dark and cinematic; they differ only in the colour of the light behind the product. */
const themes = {
  red: {
    text: 'text-white',
    muted: 'text-white/75',
    eyebrow: 'text-white/80',
    line: 'bg-white/40',
    dot: 'border-white/80',
    dotOn: 'bg-white',
    dotHover: 'hover:bg-white/40',
    arc: ['#ffb27a', '#ffe3c8'],
    floor: 'rgba(255, 255, 255, 0.14)',
    base: 'bg-[radial-gradient(ellipse_at_70%_40%,#4a1218_0%,#1c1012_45%,#0d0b0c_100%)]',
    glow: 'bg-[#d93b34]/25',
    accent: 'bg-gradient-to-r from-[#ff8a7e] to-[#e8453c]',
    button: 'bg-white text-navy-950 hover:bg-brand-50',
  },
  // Light theme: pale sky-to-peach background, dark text, orange highlight and button.
  black: {
    text: 'text-navy-950',
    muted: 'text-navy-900/80',
    eyebrow: 'text-navy-900',
    line: 'bg-navy-900/40',
    dot: 'border-navy-900/70',
    dotOn: 'bg-navy-950',
    dotHover: 'hover:bg-navy-900/30',
    arc: ['#ff9a4d', '#ffd9b8'],
    floor: 'rgba(70, 40, 30, 0.13)',
    base: 'bg-[linear-gradient(100deg,#bfd0ea_0%,#e9dfdc_38%,#f6e2d2_62%,#8e939d_100%)] dark:bg-[linear-gradient(100deg,#1b2433_0%,#2a1a1c_40%,#3a2218_65%,#1d1b1e_100%)]',
    glow: 'bg-[#ff9a4d]/25',
    accent: 'bg-gradient-to-r from-[#ff9a4d] to-[#f26a1b]',
    button: 'bg-gradient-to-r from-[#ff8a3d] to-[#f26a1b] text-white hover:brightness-110',
  },
  // Warm theme: cream-to-sand background with golden light, like a softly lit living room.
  warm: {
    text: 'text-navy-950',
    muted: 'text-navy-900/80',
    eyebrow: 'text-navy-900',
    line: 'bg-navy-900/40',
    dot: 'border-navy-900/70',
    dotOn: 'bg-navy-950',
    dotHover: 'hover:bg-navy-900/30',
    arc: ['#ffb45e', '#fff0d6'],
    floor: 'rgba(120, 70, 30, 0.16)',
    base: 'bg-[linear-gradient(100deg,#f3e3d0_0%,#e9cfb4_45%,#dcb792_75%,#c99a6e_100%)] dark:bg-[linear-gradient(100deg,#2a1a12_0%,#3a2416_45%,#4a2e18_75%,#2a1b12_100%)]',
    glow: 'bg-[#ffc46b]/45',
    accent: 'bg-gradient-to-r from-[#ff9a4d] to-[#f26a1b]',
    button: 'bg-gradient-to-r from-[#ff8a3d] to-[#f26a1b] text-white hover:brightness-110',
  },
};

/**
 * Full-width dark hero: a glowing arc and soft light behind a floating product image, big headline on the left.
 * Slides fade into each other; the text, button and image of every slide come from Strapi.
 */
export function HeroSlider({ slides, autoplay = true, seconds = 4 }: { slides: HeroSlide[]; autoplay?: boolean; seconds?: number }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  useEffect(() => {
    if (paused || count < 2 || !autoplay) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setActive((current) => (current + 1) % count);
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [paused, count, autoplay, seconds]);

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured"
      className="hero-stage relative grid overflow-hidden text-white"
      onPointerEnter={(event) => event.pointerType === 'mouse' && setPaused(true)}
      onPointerMove={(event) => {
        // Depth parallax: tell the hero layers where the pointer is (-1 to 1 across the banner).
        if (event.pointerType !== 'mouse') return;
        const box = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty('--px', (((event.clientX - box.left) / box.width) * 2 - 1).toFixed(3));
        event.currentTarget.style.setProperty('--py', (((event.clientY - box.top) / box.height) * 2 - 1).toFixed(3));
      }}
      onPointerLeave={(event) => {
        if (event.pointerType !== 'mouse') return;
        setPaused(false);
        event.currentTarget.style.setProperty('--px', '0');
        event.currentTarget.style.setProperty('--py', '0');
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {slides.map((slide, index) => {
        const theme = themes[slide.theme];
        const on = index === active;
        return (
          <div
            key={slide.heading}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${count}`}
            aria-hidden={!on}
            inert={!on}
            className={`relative col-start-1 row-start-1 overflow-hidden transition-opacity duration-[1400ms] ease-in-out ${theme.text} ${theme.base} ${on ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            {/* 3D stage: a perspective floor and halo rings under the product, then soft light and a glowing arc behind it. */}
            <div className="hero-floor" style={{ '--floor': theme.floor } as React.CSSProperties} aria-hidden="true" />
            <div className="hero-halo right-[4%] top-[34%] hidden size-[26rem] lg:block" aria-hidden="true" />
            <div className={`hero-layer hero-layer-glow pointer-events-none absolute right-[8%] top-[18%] size-[24rem] rounded-full blur-[90px] ${theme.glow}`} aria-hidden="true" />
            <svg
              className="arc-glow hero-layer hero-layer-arc pointer-events-none absolute -right-10 -top-12 hidden h-[30rem] w-[30rem] lg:block"
              viewBox="0 0 600 600"
              fill="none"
              aria-hidden="true"
              style={{ filter: 'drop-shadow(0 0 10px rgba(255,170,110,0.55))' }}
            >
              <defs>
                <linearGradient id={`arc-${index}`} x1="0" y1="1" x2="1" y2="0">
                  <stop offset="0" stopColor={theme.arc[0]} stopOpacity="0" />
                  <stop offset="0.55" stopColor={theme.arc[0]} stopOpacity="0.95" />
                  <stop offset="1" stopColor={theme.arc[1]} />
                </linearGradient>
              </defs>
              <path d="M90 560A270 270 0 0 1 520 90" stroke={`url(#arc-${index})`} strokeWidth="3" strokeLinecap="round" />
            </svg>

            <div className="container-page relative grid items-center gap-4 pb-12 pt-8 lg:min-h-[26.2rem] lg:grid-cols-[1fr_1.2fr] lg:gap-6 lg:pb-8 lg:pt-8">
              <div className="hero-layer hero-layer-text relative z-10">
                {slide.eyebrow && (
                  <p className={`flex items-center gap-4 text-xs font-semibold uppercase tracking-[0.3em] ${theme.eyebrow} ${on ? 'hero-in' : ''}`}>
                    {slide.eyebrow}
                    <span className={`hidden h-px w-24 ${theme.line} sm:block`} aria-hidden="true" />
                  </p>
                )}
                <h1 className={`mt-4 max-w-xl text-3xl font-extrabold leading-[1.08] tracking-tight sm:text-4xl lg:text-5xl ${on ? 'hero-chars-on' : ''}`}>
                  <SplitChars text={slide.heading} accentClass={`${theme.accent} bg-clip-text text-transparent`} />
                </h1>
                {slide.subheading && (
                  <p className={`mt-3 max-w-md text-base leading-relaxed ${theme.muted} sm:text-lg ${on ? 'hero-in [animation-delay:220ms]' : ''}`}>{slide.subheading}</p>
                )}
                {slide.buttonLabel && slide.buttonUrl && (
                  <Link
                    href={slide.buttonUrl}
                    className={`group mt-6 inline-flex items-center gap-3 rounded-full px-7 py-3.5 text-sm font-semibold shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 active:scale-95 ${theme.button} ${on ? 'hero-in [animation-delay:340ms]' : ''}`}
                  >
                    {slide.buttonLabel}
                    <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                )}
              </div>

              {slide.image && (
                <div className={`relative z-10 ${on ? 'hero3d-in [animation-delay:150ms]' : ''}`}>
                  <div className="hero-layer hero-layer-img">
                    <div className="float-3d relative mx-auto aspect-[1717/917] w-full max-w-[22rem] sm:max-w-[30rem] lg:max-w-[40rem]">
                      <div className="absolute -bottom-3 left-[8%] right-[8%] h-6 rounded-[50%] bg-black/60 blur-xl" aria-hidden="true" />
                      <Image
                        src={slide.image.src}
                        alt={slide.image.alt}
                        fill
                        priority={index === 0}
                        sizes="(min-width: 1024px) 55vw, 100vw"
                        className="object-contain drop-shadow-[0_28px_40px_rgba(0,0,0,0.55)]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {count > 1 && (
        <div className="container-page pointer-events-none absolute inset-x-0 bottom-5 z-20 col-start-1 row-start-1 flex items-end">
          <div className="pointer-events-auto flex w-full items-center gap-2.5">
            {slides.map((slide, index) => (
              <button
                key={slide.heading}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === active}
                onClick={() => setActive(index)}
                className={`h-2.5 rounded-full border transition-all duration-300 ${themes[slides[active].theme].dot} ${index === active ? `w-8 ${themes[slides[active].theme].dotOn}` : `w-2.5 bg-transparent ${themes[slides[active].theme].dotHover}`}`}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
