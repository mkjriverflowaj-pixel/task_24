/** Five stars filled to the given rating (out of 5), with the rating and the number of reviews beside them. */
export function Stars({ rating, count, size = 'sm', showNumber = true }: { rating?: number | null; count?: number | null; size?: 'sm' | 'md'; showNumber?: boolean }) {
  if (rating == null) return null;
  const px = size === 'md' ? 18 : 14;
  const filled = Math.max(0, Math.min(5, rating));
  return (
    <div className="flex items-center gap-1.5" role="img" aria-label={`Rated ${filled.toFixed(1)} out of 5${count != null ? ` from ${count} reviews` : ''}`}>
      <span className="relative inline-flex" aria-hidden="true">
        <span className="flex text-navy-950/15">
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} px={px} />
          ))}
        </span>
        <span className="absolute inset-y-0 left-0 flex overflow-hidden text-[#f5a623]" style={{ width: `${(filled / 5) * 100}%` }}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Star key={i} px={px} />
          ))}
        </span>
      </span>
      {showNumber && <span className={`${size === 'md' ? 'text-sm' : 'text-xs'} font-semibold text-navy-950`}>{filled.toFixed(1)}</span>}
      {count != null && <span className={`${size === 'md' ? 'text-sm' : 'text-xs'} text-muted`}>({count.toLocaleString('en-IN')})</span>}
    </div>
  );
}

function Star({ px }: { px: number }) {
  return (
    <svg viewBox="0 0 24 24" width={px} height={px} fill="currentColor" className="shrink-0">
      <path d="m12 2.8 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 16.8l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}
