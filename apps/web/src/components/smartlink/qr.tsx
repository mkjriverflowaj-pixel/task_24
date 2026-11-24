/** Decorative QR codes (not scannable): a seeded random pattern with the three corner finders. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function qrMatrix(seed: number, n = 21): number[][] {
  const r = rng(seed);
  const m: number[][] = [];
  for (let y = 0; y < n; y++) {
    m.push([]);
    for (let x = 0; x < n; x++) m[y].push(r() > 0.52 ? 1 : 0);
  }
  const finder = (ox: number, oy: number) => {
    for (let y = -1; y < 8; y++)
      for (let x = -1; x < 8; x++) {
        const X = ox + x;
        const Y = oy + y;
        if (X < 0 || Y < 0 || X >= n || Y >= n) continue;
        const ring = Math.max(Math.abs(x - 3), Math.abs(y - 3));
        m[Y][X] = x < 0 || y < 0 || x > 6 || y > 6 ? 0 : ring === 3 || ring <= 1 ? 1 : 0;
      }
  };
  finder(0, 0);
  finder(n - 7, 0);
  finder(0, n - 7);
  for (let i = 8; i < n - 8; i++) {
    m[6][i] = i % 2 ? 0 : 1;
    m[i][6] = i % 2 ? 0 : 1;
  }
  return m;
}

export function QrSvg({ seed }: { seed: number }) {
  const m = qrMatrix(seed);
  const n = m.length;
  return (
    <svg viewBox={`0 0 ${n} ${n}`} fill="#1c1416" shapeRendering="crispEdges" aria-hidden="true">
      {m.flatMap((row, y) => row.map((v, x) => (v ? <rect key={`${x}-${y}`} x={x} y={y} width="1.02" height="1.02" /> : null)))}
    </svg>
  );
}

/** Small product drawings used on the phone screens and in the demo. */
export const arts = {
  sw: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="8" y="22" width="104" height="76" rx="6" fill="#fff" stroke="#d6cdce" strokeWidth="3" />
      <rect x="24" y="36" width="72" height="48" rx="3" fill="#77706f" />
      <g fill="#f6f3f3" stroke="#d6cdce">
        <rect x="26" y="38" width="23" height="44" rx="2" />
        <rect x="50" y="38" width="23" height="44" rx="2" />
        <rect x="74" y="38" width="20" height="44" rx="2" />
      </g>
    </svg>
  ),
  db: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="22" y="14" width="34" height="92" rx="3" fill="#fff" stroke="#d6cdce" strokeWidth="3" />
      <rect x="32" y="40" width="14" height="22" rx="2" fill="#e3262d" />
      <g transform="translate(42 0)">
        <rect x="22" y="14" width="34" height="92" rx="3" fill="#fff" stroke="#d6cdce" strokeWidth="3" />
        <rect x="32" y="40" width="14" height="22" rx="2" fill="#e3262d" />
      </g>
    </svg>
  ),
  fan: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <rect x="12" y="12" width="96" height="96" rx="16" fill="#fff" stroke="#d6cdce" strokeWidth="3" />
      <circle cx="60" cy="60" r="38" fill="#2a2224" />
      <g fill="#8d8486">
        <path d="M60 60c-2-16 4-26 12-26s4 18-12 26z" />
        <path d="M60 60c14-8 26-6 28 1s-14 12-28-1z" />
        <path d="M60 60c2 16-4 26-12 26s-4-18 12-26z" />
        <path d="M60 60c-14 8-26 6-28-1s14-12 28 1z" />
      </g>
      <circle cx="60" cy="60" r="6" fill="#e3262d" />
    </svg>
  ),
  wire: (
    <svg viewBox="0 0 120 120" aria-hidden="true">
      <g fill="none" strokeWidth="9">
        <ellipse cx="44" cy="66" rx="26" ry="30" stroke="#e3262d" />
        <ellipse cx="80" cy="54" rx="26" ry="30" stroke="#2f6fe0" />
      </g>
      <path d="M58 98c14 10 34 6 44-10" fill="none" stroke="#f2c230" strokeWidth="9" strokeLinecap="round" />
    </svg>
  ),
} as const;
