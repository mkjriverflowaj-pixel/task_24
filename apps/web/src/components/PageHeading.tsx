import Link from 'next/link';

type Crumb = { label: string; href?: string };

/** Dark banner with breadcrumbs. Pass no title when the page shows its own heading below the banner. */
export function PageHeading({ title, crumbs, subtitle }: { title?: string; crumbs: Crumb[]; subtitle?: string | null }) {
  return (
    <section className="bg-navy-950 py-12 text-white">
      <div className="container-page">
        <nav aria-label="Breadcrumb" className={`text-sm text-white/70 ${title ? 'mb-3' : ''}`}>
          <ol className="flex flex-wrap items-center gap-2">
            {crumbs.map((crumb, index) => (
              <li key={crumb.label} className="flex items-center gap-2">
                {index > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? <Link href={crumb.href} className="hover:text-brand-400">{crumb.label}</Link> : <span aria-current="page">{crumb.label}</span>}
              </li>
            ))}
          </ol>
        </nav>
        {title && <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>}
        {subtitle && <p className="mt-3 max-w-2xl text-white/80">{subtitle}</p>}
      </div>
    </section>
  );
}
