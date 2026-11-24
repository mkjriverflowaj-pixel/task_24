import Image from 'next/image';
import Link from 'next/link';
import { Accent } from './Accent';
import { ArrowRight } from './icons';

type PromoBannerProps = {
  title: string;
  subtitle?: string;
  label?: string;
  href?: string;
  image?: { src: string; alt: string } | null;
};

/** Soft pink banner with a headline, one line of text and a button; the lifestyle photo on the left is optional. */
export function PromoBanner({ title, subtitle, label, href = '/products', image }: PromoBannerProps) {
  return (
    <section className="container-page py-2">
      <div className="scroll-turn relative flex flex-col overflow-hidden rounded-2xl bg-gradient-to-r from-[#f6cfd5] via-[#fbe3e6] to-[#f8d9de] lg:flex-row lg:items-center">
        {image && (
          <div className="relative h-24 w-full lg:h-24 lg:w-[22%] lg:shrink-0">
            <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1024px) 22vw, 100vw" className="object-cover" />
          </div>
        )}
        <div className="flex flex-1 flex-col items-start justify-between gap-3 px-6 py-3.5 sm:flex-row sm:items-center lg:px-10">
          <div>
            <h2 className="text-xl font-light text-navy-950 sm:text-2xl">
              <Accent text={title} className="ml-1 inline text-2xl font-bold text-brand-500 sm:text-3xl" />
            </h2>
            {subtitle && <p className="mt-0.5 text-sm text-navy-900">{subtitle}</p>}
          </div>
          {label && (
            <Link href={href} className="btn-primary btn-pulse shrink-0">
              {label}
              <ArrowRight className="nudge-x size-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
