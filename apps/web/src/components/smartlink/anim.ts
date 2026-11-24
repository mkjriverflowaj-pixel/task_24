export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const easeInOut2 = (p: number) => (p < 0.5 ? 2 * p * p : 1 - 2 * (1 - p) * (1 - p));
export const easeIn2 = (p: number) => p * p;
export const easeOut3 = (p: number) => 1 - Math.pow(1 - p, 3);
export const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Tween a number with requestAnimationFrame; returns a cancel function. */
export function tweenNumber(from: number, to: number, ms: number, onUpdate: (v: number) => void) {
  if (reducedMotion()) {
    onUpdate(to);
    return () => {};
  }
  let raf = 0;
  const t0 = performance.now();
  const tick = (now: number) => {
    const p = clamp01((now - t0) / ms);
    onUpdate(Math.round(lerp(from, to, easeOut3(p))));
    if (p < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

/** Height of the site header, so pinned stages sit just beneath it. */
export function headerHeight() {
  return Math.round(document.querySelector('header')?.getBoundingClientRect().height ?? 0);
}
