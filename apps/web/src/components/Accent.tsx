/** Colors the **marked** words of a CMS heading, e.g. "Explore Our **Categories**". */
export function Accent({ text, className = 'text-brand-500' }: { text: string; className?: string }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, index) =>
    index % 2 ? <span key={index} className={className}>{part}</span> : part,
  );
}
