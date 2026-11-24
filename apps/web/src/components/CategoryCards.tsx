import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl, type Category } from '@/lib/strapi';
import { ArrowRight } from './icons';
import { Reveal } from './Reveal';
import { Tilt3D } from './Tilt3D';

/** Three-column grid of white cards: product image, name, short line and a round arrow button. */
export function CategoryCards({ categories }: { categories: Category[] }) {
  // Only full rows of three are shown so the grid stays even; the Explore Products banner below leads to every range.
  const shown = categories.length >= 3 ? categories.slice(0, categories.length - (categories.length % 3)) : categories;

  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {shown.map((category, index) => {
        const image = mediaUrl(category.image);
        return (
          <Reveal as="li" key={category.documentId} delay={(index % 3) * 90} variant={(['3d-left', '3d', '3d-right'] as const)[index % 3]} className={shown.length % 2 === 1 && index === shown.length - 1 ? 'sm:max-xl:hidden' : ''}>
            <Tilt3D radius="1rem">
            <Link
              href={`/products/${category.slug}`}
              className="group relative flex h-full items-center gap-5 rounded-2xl bg-white p-4 shadow-[0_6px_24px_rgba(20,32,46,0.09)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(20,32,46,0.14)]"
            >
              <div className="depth-2 relative size-28 shrink-0 overflow-hidden rounded-xl bg-[#eceef1] shadow-[0_10px_22px_rgba(20,32,46,0.18)] xl:size-32">
                {image ? (
                  <Image
                    src={image}
                    alt={category.image?.alternativeText ?? category.name}
                    fill
                    sizes="128px"
                    className="object-contain p-2 transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center text-navy-900/20">
                    <svg viewBox="0 0 24 24" className="size-10" fill="currentColor" aria-hidden="true">
                      <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="depth-1 min-w-0 pr-10">
                <h3 className="text-lg font-bold leading-snug text-navy-950">{category.name}</h3>
                {category.tagline && <p className="mt-2 text-sm leading-snug text-muted">{category.tagline}</p>}
              </div>
              <span className="absolute bottom-4 right-4 grid size-8 place-items-center rounded-full bg-brand-50 text-brand-500 transition duration-300 group-hover:translate-x-1 group-hover:bg-brand-500 group-hover:text-white">
                <ArrowRight className="size-4" />
              </span>
            </Link>
            </Tilt3D>
          </Reveal>
        );
      })}
    </ul>
  );
}
