'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

const INTERVAL_MS = 5000;
const CARDS_IN_VIEW = 3;
/** Must match the duration-700 class on the track. */
const SLIDE_MS = 700;

type CarouselProps = {
  slides: ReactNode[];
  /** Width classes for one slide (including the horizontal gutter padding). */
  slideClass?: string;
  label: string;
  inactiveDotClass?: string;
  /** Classes for the dot of the current slide. */
  activeDotClass?: string;
  /** Show previous/next buttons at the sides (only when the slides loop). */
  arrows?: boolean;
  /** Time between automatic slide changes. */
  intervalMs?: number;
};

/**
 * Sliding carousel that shows up to three slides at once on large screens.
 * With more than three slides it auto-advances and loops by sliding on into clones of the first slides,
 * then jumps back to the identical real slides. The jump is timer-based so it never depends on the browser
 * firing an animation-finished event (which can be skipped in background tabs or while the page is busy).
 */
export function Carousel({
  slides,
  slideClass = 'w-full px-2.5 md:w-1/2 lg:w-1/3',
  label,
  inactiveDotClass = 'size-2.5 bg-black',
  activeDotClass = 'size-3.5 bg-black',
  arrows = false,
  intervalMs = INTERVAL_MS,
}: CarouselProps) {
  const count = slides.length;
  const loops = count > CARDS_IN_VIEW;
  const track = loops ? [...slides, ...slides.slice(0, CARDS_IN_VIEW)] : slides;
  // 0..count-1 are the real slides; `count` shows the clones, which look identical to slide 0.
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [paused, setPaused] = useState(false);
  const [step, setStep] = useState(0);
  const firstSlide = useRef<HTMLDivElement>(null);
  // Click-and-drag (mouse) or swipe (touch): the track follows the pointer, then snaps to the next/previous slide.
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ startX: 0, active: false, moved: false });

  useEffect(() => {
    const element = firstSlide.current;
    if (!element) return;
    const measure = () => setStep(element.getBoundingClientRect().width);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !loops) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = setInterval(() => {
      if (document.hidden || drag.current.active) return;
      // Stay put while a jump back from the clones is pending, so the position can never run past the track.
      setIndex((current) => (current >= count ? current : current + 1));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [paused, loops, count, intervalMs]);

  useEffect(() => {
    if (!loops || index < count) return;
    const jump = setTimeout(() => {
      setAnimate(false);
      setIndex(index % count);
      setTimeout(() => setAnimate(true), 60);
    }, SLIDE_MS + 40);
    return () => clearTimeout(jump);
  }, [index, count, loops]);

  const active = index % count;

  const next = () => {
    setAnimate(true);
    setIndex((current) => Math.min(current + 1, count));
  };

  const previous = () => {
    if (index > 0) {
      setAnimate(true);
      setIndex(index - 1);
      return;
    }
    // At the first slide: jump to the identical clones at the end, then slide back one step.
    setAnimate(false);
    setIndex(count);
    setTimeout(() => {
      setAnimate(true);
      setIndex(count - 1);
    }, 60);
  };

  const onDown = (event: React.PointerEvent) => {
    if (!loops || (event.pointerType === 'mouse' && event.button !== 0)) return;
    drag.current = { startX: event.clientX, active: true, moved: false };
  };

  const onMove = (event: React.PointerEvent) => {
    const state = drag.current;
    if (!state.active) return;
    const dx = event.clientX - state.startX;
    if (!state.moved && Math.abs(dx) < 6) return;
    if (!state.moved) {
      state.moved = true;
      setDragging(true);
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // Capture is only a convenience; dragging still works without it.
      }
    }
    setDragX(dx);
  };

  const onUp = () => {
    const state = drag.current;
    if (!state.active) return;
    state.active = false;
    if (!state.moved) return;
    const threshold = Math.min(90, step * 0.2);
    const dx = dragX;
    setDragging(false);
    setAnimate(true);
    setDragX(0);
    if (dx <= -threshold && index < count) next();
    else if (dx >= threshold) previous();
  };

  return (
    <div
      className="relative"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
      onPointerEnter={(event) => event.pointerType === 'mouse' && setPaused(true)}
      onPointerLeave={(event) => event.pointerType === 'mouse' && setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div
        className={`touch-pan-y select-none overflow-hidden ${loops ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          // A drag that ends over a link must not also open it.
          if (drag.current.moved) {
            event.preventDefault();
            event.stopPropagation();
            drag.current.moved = false;
          }
        }}
      >
        <div
          className={`-mx-2.5 flex will-change-transform ${animate && !dragging ? 'transition-transform duration-700 ease-in-out motion-reduce:transition-none' : ''}`}
          style={{ transform: `translateX(${-index * step + dragX}px)` }}
        >
          {track.map((slide, position) => (
            <div key={position} ref={position === 0 ? firstSlide : undefined} aria-hidden={position >= count} className={`shrink-0 ${slideClass}`}>
              {slide}
            </div>
          ))}
        </div>
      </div>
      {arrows && loops && (
        <>
          <button
            type="button"
            aria-label="Previous slide"
            onClick={previous}
            className="absolute left-0 top-[45%] z-10 grid size-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-500 shadow-md transition hover:bg-brand-500 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 6-6 6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={next}
            className="absolute right-0 top-[45%] z-10 grid size-10 translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-brand-500 shadow-md transition hover:bg-brand-500 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.500" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        </>
      )}
      {loops && (
        <div className="mt-7 flex items-center justify-center gap-2.5">
          {slides.map((_, position) => (
            <button
              key={position}
              type="button"
              aria-label={`Show slide ${position + 1}`}
              aria-current={position === active}
              onClick={() => {
                setAnimate(true);
                setIndex(position);
              }}
              className={`rounded-full transition-all ${position === active ? activeDotClass : inactiveDotClass}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
