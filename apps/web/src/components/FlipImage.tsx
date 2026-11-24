'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

/**
 * Round badge that spins like a wheel: one full turn, and at the half-way point the pink face
 * changes to a black one (and back on the next turn). Spins by itself every few seconds
 * (not under reduced-motion), pauses on hover, and spins on click.
 */
export function FlipImage({ image, backImage }: { image: { src: string; alt: string }; backImage: { src: string; alt: string } }) {
  const [spins, setSpins] = useState(0);
  const [paused, setPaused] = useState(false);
  const dark = spins % 2 === 1;

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      if (!document.hidden) setSpins((n) => n + 1);
    }, 3500);
    return () => clearInterval(timer);
  }, [paused]);

  const layer = 'absolute inset-0 grid place-items-center rounded-full transition-opacity duration-300 delay-[350ms]';

  return (
    <button
      type="button"
      aria-label="Spin the badge"
      onClick={() => setSpins((n) => n + 1)}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setPaused(false)}
      className="mx-auto hidden size-60 cursor-pointer xl:block"
    >
      <span
        className="relative block size-full transition-transform duration-[1100ms] ease-[cubic-bezier(0.45,0,0.2,1)]"
        style={{ transform: `rotate(${spins * 360}deg)` }}
      >
        <span className={`${layer} bg-gradient-to-br from-[#fbdde1] to-[#fdeff1] ${dark ? 'opacity-0' : 'opacity-100'}`} />
        <span className={`${layer} bg-gradient-to-br from-black via-[#0b0607] to-[#1d0c0f] ${dark ? 'opacity-100' : 'opacity-0'}`} />
        {[
          { img: image, show: !dark, box: 'h-40 w-56', glow: 'drop-shadow-[0_14px_18px_rgba(0,0,0,0.18)]' },
          { img: backImage, show: dark, box: 'h-48 w-44', glow: 'drop-shadow-[0_10px_24px_rgba(255,255,255,0.18)]' },
        ].map(({ img, show, box, glow }) => (
          <span key={img.src} className={`absolute left-1/2 top-1/2 block ${box} -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300 delay-[350ms] ${show ? 'opacity-100' : 'opacity-0'}`}>
            <Image src={img.src} alt={show ? img.alt : ''} fill sizes="224px" className={`object-contain ${glow}`} />
          </span>
        ))}
      </span>
    </button>
  );
}
