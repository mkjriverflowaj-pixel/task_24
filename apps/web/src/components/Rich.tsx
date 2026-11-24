import type { ReactNode } from 'react';

const linkClass = 'font-medium text-brand-500 hover:opacity-80';
const NEXTDYNAMIX_URL = 'https://nextdynamix.com/';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.safonix.app&hl=en_IN';

// Matches URLs, email addresses, "Nextdynamix", or "Safonix app".
const LINK_PATTERN = /(https?:\/\/[^\s<>"]*[^\s<>".,;:!?)]|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|Nextdynamix|Safonix Smart Link|Safonix app)/g;

/** A word that shows a hover/focus card above it. */
function HoverCard({ trigger, children }: { trigger: ReactNode; children: ReactNode }) {
  return (
    <span className="group relative inline-block">
      {trigger}
      <span className="invisible absolute bottom-full left-0 z-20 w-64 pb-2 opacity-0 transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <span className="block rounded-lg border-l-4 border-brand-500 bg-white p-3 text-left text-sm leading-snug shadow-lg ring-1 ring-black/10">
          {children}
        </span>
      </span>
    </span>
  );
}

/** "Safonix app" with a hover/focus card pointing to the Play Store listing. */
function AppHoverCard({ label }: { label: string }) {
  return (
    <HoverCard
      trigger={
        <span tabIndex={0} className="cursor-help border-b border-dotted border-brand-500 font-medium text-navy-950 outline-none">
          {label}
        </span>
      }
    >
      <span className="block font-bold text-navy-950">Safonix Smart Link</span>
      <span className="mt-0.5 block">
        <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>Download</a> in Play Store
      </span>
    </HoverCard>
  );
}

/** "Nextdynamix" as a link, with a hover/focus card showing the company name and website. */
function NextdynamixHoverCard({ label }: { label: string }) {
  return (
    <HoverCard
      trigger={
        <a href={NEXTDYNAMIX_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>{label}</a>
      }
    >
      <span className="block font-bold text-navy-950">Nextdynamix Tech (OPC) Pvt. Ltd.</span>
      <span className="mt-0.5 block">
        <a href={NEXTDYNAMIX_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>Visit website</a>
      </span>
    </HoverCard>
  );
}

function linkify(text: string, keyPrefix: string): ReactNode[] {
  return text.split(LINK_PATTERN).map((part, index) => {
    if (index % 2 === 0) return part;
    const key = `${keyPrefix}-${index}`;
    if (part === 'Safonix app' || part === 'Safonix Smart Link') return <AppHoverCard key={key} label={part} />;
    if (part === 'Nextdynamix') return <NextdynamixHoverCard key={key} label={part} />;
    if (part.includes('@')) return <a key={key} href={`mailto:${part}`} className={linkClass}>{part}</a>;
    return <a key={key} href={part} target="_blank" rel="noopener noreferrer" className={linkClass}>{part}</a>;
  });
}

/** Renders **bold** markers from CMS text as <strong>, and turns emails, URLs and "Nextdynamix" into links. */
export function Rich({ text }: { text: string }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 ? (
      <strong key={index} className="font-bold">{linkify(part, String(index))}</strong>
    ) : (
      linkify(part, String(index))
    ),
  );
}
