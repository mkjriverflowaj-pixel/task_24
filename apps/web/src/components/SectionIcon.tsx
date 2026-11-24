const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const paths: Record<string, React.ReactNode> = {
  factory: (
    <>
      <path d="M3 21V10l6 3V10l6 3V6h4v15z" />
      <path d="M7 17h2M12 17h2M17 17h0" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v6c0 4.500 3 7.500 7 9 4-1.500 7-4.500 7-9V6z" />
      <path d="m9 12 2.200 2.200L15.500 10" />
    </>
  ),
  box: (
    <>
      <path d="m12 3 8 4.500v9L12 21l-8-4.500v-9z" />
      <path d="m4 7.500 8 4.500 8-4.500M12 12v9" />
    </>
  ),
  gear: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2.500M12 18.500V21M3 12h2.500M18.500 12H21M5.600 5.600l1.800 1.800M16.600 16.600l1.800 1.800M5.600 18.400l1.800-1.800M16.600 7.400l1.800-1.800" />
    </>
  ),
  flask: (
    <>
      <path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.800 3h10.400A2 2 0 0 0 19 18l-5-9V3" />
      <path d="M7.500 15h9" />
    </>
  ),
  chip: (
    <>
      <rect x="6" y="6" width="12" height="12" rx="2" />
      <path d="M9 3v3M15 3v3M9 18v3M15 18v3M3 9h3M3 15h3M18 9h3M18 15h3" />
    </>
  ),
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.500" />
      <rect x="17" y="14" width="4" height="6" rx="1.500" />
      <path d="M19 20c0 1-1.500 1.500-4 1.500" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.500 9.500a2.500 2.500 0 1 1 3.500 2.300c-.7.400-1 .9-1 1.700M12 17h.01" />
    </>
  ),
  gift: (
    <>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M12 8v13M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8" />
      <path d="M12 8c-1-3-5-4-5-1.500S10 8 12 8Zm0 0c1-3 5-4 5-1.500S14 8 12 8Z" />
    </>
  ),
  wallet: (
    <>
      <path d="M4 7a2 2 0 0 1 2-2h11v4" />
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M16 13.500h2" />
    </>
  ),
  chat: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9.500h8M8 12.500h5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.500" />
      <path d="M5 20c0-3.500 3.100-6 7-6s7 2.500 7 6" />
    </>
  ),
};

/** Small line icon picked by name in Strapi (factory, shield, box, gear, flask, chip, headset, user). */
export function SectionIcon({ name, className = 'size-6' }: { name?: string | null; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g {...stroke}>{paths[name ?? ''] ?? paths.factory}</g>
    </svg>
  );
}
