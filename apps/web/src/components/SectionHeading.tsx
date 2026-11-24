
/** Same as Accent, but every word sits in a mask so it can rise into place (see .split-w in globals.css). */
function SplitWords({ text }: { text: string }) {
  let index = 0;
  return text.split(/\*\*(.+?)\*\*/g).flatMap((part, partIndex) =>
    part.split(/\s+/).filter(Boolean).map((word) => {
      const i = index;
      index += 1;
      return (
        <span key={`${partIndex}-${i}`}>
          <span className="split-w">
            <span className={partIndex % 2 ? 'text-brand-500' : ''} style={{ '--i': i } as React.CSSProperties}>
              {word}
            </span>
          </span>{' '}
        </span>
      );
    }),
  );
}

/** Centered section title with a small red eyebrow flanked by thin lines. */
export function SectionHeading({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="flex items-center justify-center gap-3 text-sm font-bold uppercase tracking-wide text-brand-500">
          <span className="h-px w-12 bg-brand-500/40" aria-hidden="true" />
          {eyebrow}
          <span className="h-px w-12 bg-brand-500/40" aria-hidden="true" />
        </p>
      )}
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl">
        <SplitWords text={title} />
      </h2>
      <span className="heading-rule mx-auto mt-4 block h-0.5 w-14 rounded bg-brand-500" aria-hidden="true" />
      {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
    </div>
  );
}
