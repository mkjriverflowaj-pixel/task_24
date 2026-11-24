'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type ZoomImage = { src: string; alt: string };

const MIN = 1;
const MAX = 6;
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value));

/**
 * Full-screen picture viewer with zoom. Zoom with the + / − buttons, the mouse wheel, a double click (or double tap) or a
 * two-finger pinch; drag to move around a zoomed picture. Keys: + / − / 0 to zoom, ← → to change picture, Esc to close.
 */
export function ZoomViewer({ images, index, onIndex, onClose }: { images: ZoomImage[]; index: number; onIndex: (next: number) => void; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ startDistance: 0, startScale: 1, lastX: 0, lastY: 0 });
  const image = images[index];

  const limit = useCallback(
    (x: number, y: number, s: number) => {
      const box = stage.current?.getBoundingClientRect();
      const maxX = box ? (box.width * (s - 1)) / 2 : 0;
      const maxY = box ? (box.height * (s - 1)) / 2 : 0;
      return { x: clamp(x, -maxX, maxX), y: clamp(y, -maxY, maxY) };
    },
    [],
  );

  const zoomTo = useCallback(
    (next: number) => {
      const s = clamp(next, MIN, MAX);
      setScale(s);
      setOffset((current) => (s === 1 ? { x: 0, y: 0 } : limit(current.x, current.y, s)));
    },
    [limit],
  );

  const change = useCallback(
    (step: number) => {
      if (images.length < 2) return;
      setScale(1);
      setOffset({ x: 0, y: 0 });
      onIndex((index + step + images.length) % images.length);
    },
    [images.length, index, onIndex],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === '+' || event.key === '=') zoomTo(scale * 1.4);
      else if (event.key === '-') zoomTo(scale / 1.4);
      else if (event.key === '0') zoomTo(1);
      else if (event.key === 'ArrowRight') change(1);
      else if (event.key === 'ArrowLeft') change(-1);
    };
    window.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose, zoomTo, scale, change]);

  // Wheel zoom needs a non-passive listener so the page behind does not scroll.
  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      zoomTo(scale * (1 - event.deltaY * 0.0018));
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [scale, zoomTo]);

  function down(event: React.PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    gesture.current.lastX = event.clientX;
    gesture.current.lastY = event.clientY;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current.startDistance = Math.hypot(a.x - b.x, a.y - b.y);
      gesture.current.startScale = scale;
    }
    setDragging(true);
  }

  function move(event: React.PointerEvent) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (gesture.current.startDistance) zoomTo(gesture.current.startScale * (distance / gesture.current.startDistance));
      return;
    }
    if (scale <= 1) return;
    const dx = event.clientX - gesture.current.lastX;
    const dy = event.clientY - gesture.current.lastY;
    gesture.current.lastX = event.clientX;
    gesture.current.lastY = event.clientY;
    setOffset((current) => limit(current.x + dx, current.y + dy, scale));
  }

  function up(event: React.PointerEvent) {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size === 0) setDragging(false);
  }

  if (!image) return null;

  const button = 'grid size-11 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-brand-500 active:scale-90 disabled:opacity-40 disabled:hover:bg-white/10';

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={`Zoom: ${image.alt}`}>
      <div className="flex items-center justify-between gap-4 px-4 py-3 text-white sm:px-6">
        <p className="truncate text-sm font-semibold">{image.alt}</p>
        <div className="flex items-center gap-2">
          <button type="button" className={button} onClick={() => zoomTo(scale / 1.4)} disabled={scale <= MIN} aria-label="Zoom out">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14" /></svg>
          </button>
          <span className="w-12 text-center text-sm tabular-nums" aria-live="polite">{Math.round(scale * 100)}%</span>
          <button type="button" className={button} onClick={() => zoomTo(scale * 1.4)} disabled={scale >= MAX} aria-label="Zoom in">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M5 12h14M12 5v14" /></svg>
          </button>
          <button type="button" className={button} onClick={() => zoomTo(1)} aria-label="Reset zoom">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>
          </button>
          <button type="button" className={`${button} ml-2`} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </div>
      </div>

      <div
        ref={stage}
        className={`relative flex-1 touch-none select-none overflow-hidden ${scale > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onDoubleClick={() => zoomTo(scale > 1 ? 1 : 2.6)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt}
          draggable={false}
          className="absolute inset-0 m-auto max-h-full max-w-full object-contain"
          style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`, transition: dragging ? 'none' : 'transform 0.25s ease-out' }}
        />
        {images.length > 1 && (
          <>
            <button type="button" className={`${button} absolute left-3 top-1/2 -translate-y-1/2`} onClick={() => change(-1)} aria-label="Previous picture">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <button type="button" className={`${button} absolute right-3 top-1/2 -translate-y-1/2`} onClick={() => change(1)} aria-label="Next picture">
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </>
        )}
      </div>
      <p className="px-4 pb-3 text-center text-xs text-white/60">Scroll, pinch or double-click to zoom · drag to move · Esc to close</p>
    </div>
  );
}
