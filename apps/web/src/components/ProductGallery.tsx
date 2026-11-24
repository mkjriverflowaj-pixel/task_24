'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ZoomViewer } from './ZoomViewer';

type GalleryImage = { src: string; alt: string };

/** Large product picture with clickable thumbnails; clicking the picture opens the zoom viewer (zoom in/out, drag, pinch). */
export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [active, setActive] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const current = images[active];

  if (!current) {
    return (
      <div className="grid aspect-square place-items-center rounded-3xl border border-line bg-surface text-navy-900/20">
        <svg viewBox="0 0 24 24" className="size-24" fill="currentColor" aria-hidden="true">
          <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="w-[90%] space-y-4">
      <button
        type="button"
        onClick={() => setZoomOpen(true)}
        aria-label={`Open ${name} in the zoom viewer`}
        className="group relative block aspect-square w-full cursor-zoom-in overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-[#f6f7fa] to-[#eceef3]"
      >
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || name}
          fill
          priority
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-contain p-10 drop-shadow-[0_18px_22px_rgba(0,0,0,0.16)]"
        />
        <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-navy-950/85 px-3.5 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur transition duration-300 group-hover:bg-brand-500">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.200-4.200M8.500 11h5M11 8.500v5" />
          </svg>
          Zoom
        </span>
      </button>
      {zoomOpen && <ZoomViewer images={images.map((image) => ({ src: image.src, alt: image.alt || name }))} index={active} onIndex={setActive} onClose={() => setZoomOpen(false)} />}
      {images.length > 1 && (
        <ul className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <li key={`${image.src}-${index}`}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show picture ${index + 1}`}
                aria-current={index === active}
                className={`relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-surface transition ${index === active ? 'border-brand-500' : 'border-transparent hover:border-brand-500/40'}`}
              >
                <Image src={image.src} alt="" fill sizes="120px" className="object-contain p-2" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
