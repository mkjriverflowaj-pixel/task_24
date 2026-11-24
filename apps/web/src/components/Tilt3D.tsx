'use client';

import { useRef, type ReactNode } from 'react';

/**
 * Wraps a card so it tilts in 3D toward the mouse, with a soft light glare that follows the cursor. Children marked with the
 * depth-1 / depth-2 / depth-3 classes lift off the card at different heights. Mouse only; touch and reduced-motion get a still card.
 */
export function Tilt3D({ children, className = '', strength = 9, radius }: { children: ReactNode; className?: string; strength?: number; radius?: string }) {
  const card = useRef<HTMLDivElement>(null);

  function move(event: React.PointerEvent) {
    const el = card.current;
    if (event.pointerType !== 'mouse' || !el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box = el.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - 0.5;
    const y = (event.clientY - box.top) / box.height - 0.5;
    el.style.setProperty('--rx', `${(-y * strength * 1.6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x * strength * 2).toFixed(2)}deg`);
    el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(0)}%`);
    el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(0)}%`);
  }

  function leave() {
    const el = card.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  }

  return (
    <div className={`tilt3d h-full ${className}`} onPointerMove={move} onPointerLeave={leave}>
      <div ref={card} className="tilt3d-card" style={radius ? { borderRadius: radius } : undefined}>
        {children}
        <span className="tilt3d-glare" aria-hidden="true" />
      </div>
    </div>
  );
}
