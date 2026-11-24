import Image from 'next/image';
import Link from 'next/link';
import { mediaUrl, type Category } from '@/lib/strapi';

export function CategoryCard({ category }: { category: Category }) {
  const image = mediaUrl(category.image);
  const subCount = category.children?.length ?? 0;

  return (
    <Link
      href={`/products/${category.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white transition hover:-translate-y-1 hover:border-brand-500 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] bg-gradient-to-br from-navy-100 to-surface">
        {image ? (
          <Image src={image} alt={category.image?.alternativeText ?? category.name} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-contain p-6 transition duration-500 group-hover:scale-110" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-navy-900/20">
            <svg viewBox="0 0 24 24" className="size-16" fill="currentColor" aria-hidden="true">
              <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="text-lg font-bold text-navy-900 group-hover:text-brand-500">{category.name}</h3>
        {category.tagline && <p className="text-sm leading-relaxed text-muted">{category.tagline}</p>}
        {subCount > 0 && (
          <p className="mt-auto pt-2 text-xs font-semibold uppercase tracking-wide text-navy-800">
            {subCount} {subCount === 1 ? 'range' : 'ranges'}
          </p>
        )}
      </div>
    </Link>
  );
}
