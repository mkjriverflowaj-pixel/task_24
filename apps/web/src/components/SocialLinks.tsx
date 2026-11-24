import type { SiteSetting } from '@/lib/strapi';

const linkClass = 'block rounded-full transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white';

function Facebook() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" aria-hidden="true">
      <circle cx="24" cy="24" r="24" fill="#4b68a6" />
      <path fill="#fff" d="M26.500 39V26h4.300l.7-5.200h-5v-3.200c0-1.500.5-2.500 2.600-2.500h2.700V10.500c-.5-.1-2.100-.2-4-.2-4 0-6.600 2.400-6.600 6.800v3.700h-4.400V26h4.400v13z" />
    </svg>
  );
}

function Instagram() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" aria-hidden="true">
      <defs>
        <linearGradient id="instagram-gradient" x1="8" y1="42" x2="40" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fdc83c" />
          <stop offset=".35" stopColor="#f7782e" />
          <stop offset=".65" stopColor="#d6308a" />
          <stop offset="1" stopColor="#6a3fc4" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="24" fill="url(#instagram-gradient)" />
      <g fill="none" stroke="#fff" strokeWidth="2.800">
        <rect x="12.500" y="12.500" width="23" height="23" rx="6.500" />
        <circle cx="24" cy="24" r="5.500" />
      </g>
      <circle cx="31" cy="17" r="1.700" fill="#fff" />
    </svg>
  );
}

function X() {
  return (
    <svg viewBox="0 0 48 48" className="size-8" aria-hidden="true">
      <circle cx="24" cy="24" r="23" fill="#0d0d0d" stroke="#6b6b6b" strokeWidth="2" />
      <path
        fill="#fff"
        transform="translate(13.200 13.200) scale(.9)"
        d="M18.901 1.153h3.680l-8.040 9.190L24 22.846h-7.406l-5.800-7.584-6.638 7.584H.474l8.600-9.830L0 1.154h7.594l5.243 6.932ZM17.610 20.644h2.039L6.486 3.240H4.298Z"
      />
    </svg>
  );
}

/** Round social icons; an icon shows only when its link is filled in under Site Setting in Strapi. */
export function SocialLinks({ site }: { site: SiteSetting }) {
  const links = [
    { label: 'Facebook', url: site.facebookUrl, icon: <Facebook /> },
    { label: 'Instagram', url: site.instagramUrl, icon: <Instagram /> },
    { label: 'X', url: site.xUrl, icon: <X /> },
  ].filter((link) => link.url);

  if (links.length === 0) return null;
  return (
    <ul className="flex items-center gap-2.5">
      {links.map((link) => (
        <li key={link.label}>
          <a href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.label} className={linkClass}>
            {link.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
