import { discountPercent, formatPrice } from '@/lib/format';

/** Price, the crossed-out "was" price and the percentage saved. */
export function Price({
  price,
  compareAt,
  unit,
  size = 'md',
  className = '',
}: {
  price?: number | null;
  compareAt?: number | null;
  unit?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  if (price == null) return null;
  const off = discountPercent(price, compareAt);
  const main = size === 'lg' ? 'text-3xl sm:text-4xl' : size === 'sm' ? 'text-base' : 'text-xl';
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-0.5 ${className}`}>
      <span className={`${main} font-extrabold tracking-tight text-navy-950`}>{formatPrice(price)}</span>
      {off > 0 && compareAt != null && (
        <>
          <span className={`${size === 'lg' ? 'text-lg' : 'text-sm'} text-muted line-through`}>{formatPrice(compareAt)}</span>
          <span className={`${size === 'lg' ? 'text-base' : 'text-xs'} font-bold text-[#1a9b55]`}>{off}% off</span>
        </>
      )}
      {unit && unit !== 'per piece' && <span className="w-full text-xs text-muted">{unit}</span>}
    </div>
  );
}
