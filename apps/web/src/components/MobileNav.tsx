'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type NavItem = { href: string; label: string; children?: NavItem[] };

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`size-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

type NodeProps = {
  item: NavItem;
  depth: number;
  expanded: Set<string>;
  toggle: (key: string) => void;
  close: () => void;
};

function Node({ item, depth, expanded, toggle, close }: NodeProps) {
  const key = `${depth}:${item.label}`;
  const hasChildren = Boolean(item.children?.length);
  const isOpen = expanded.has(key);
  const text = depth === 0 ? 'text-sm font-semibold text-navy-900' : 'text-sm text-muted';

  return (
    <li className={depth === 0 ? 'border-b border-line/60 last:border-0' : ''}>
      <div className="flex items-center">
        <Link href={item.href} onClick={close} className={`flex-1 py-3 transition-colors hover:text-brand-500 ${text}`}>
          {item.label}
        </Link>
        {hasChildren && (
          <button
            type="button"
            aria-expanded={isOpen}
            aria-label={`${isOpen ? 'Collapse' : 'Expand'} ${item.label}`}
            onClick={() => toggle(key)}
            className="grid size-10 shrink-0 place-items-center rounded-full text-navy-900 transition hover:bg-brand-50 hover:text-brand-500 active:scale-90"
          >
            <Chevron open={isOpen} />
          </button>
        )}
      </div>
      {hasChildren && (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <ul className="overflow-hidden border-l border-line pl-4" inert={!isOpen}>
            {item.children!.map((child) => (
              <Node key={`${child.href}${child.label}`} item={child} depth={depth + 1} expanded={expanded} toggle={toggle} close={close} />
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

export function MobileNav({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // While the menu is open the page behind it stays put, and Escape closes it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((value) => !value)}
        className="grid size-10 place-items-center rounded-lg border border-line text-navy-900 transition active:scale-90"
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6 6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      {open && (
        <nav className="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-line bg-white shadow-lg">
          <ul className="container-page py-2">
            {items.map((item) => (
              <Node key={`${item.href}${item.label}`} item={item} depth={0} expanded={expanded} toggle={toggle} close={() => setOpen(false)} />
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
