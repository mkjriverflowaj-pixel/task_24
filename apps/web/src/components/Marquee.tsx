/** Endless ribbon of the product groups in small, plain lettering. */
export function Marquee({ items, seconds }: { items: string[]; seconds?: number }) {
  const row = items.map((text, index) => (
    <span key={`${text}-${index}`}>
      {text}
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <rect x="2" y="1" width="16" height="18" rx="4" fill="none" stroke="#ff7a2f" strokeWidth="2" />
        <rect x="7" y="5" width="6" height="10" rx="2" fill="#d93b34" />
      </svg>
    </span>
  ));

  return (
    <div className="overflow-hidden border-y border-line bg-[#fff6f7] py-3" aria-label="Our product groups">
      <div className="marquee-track" style={seconds ? { animationDuration: `${seconds}s` } : undefined}>
        <div className="marquee-set">{row}</div>
        <div className="marquee-set" aria-hidden="true">{row}</div>
      </div>
    </div>
  );
}
