import Image from 'next/image';
import Link from 'next/link';

export function Logo({ name, onDark = false }: { name: string; onDark?: boolean }) {
  return (
    <Link
      href="/"
      aria-label={`${name} home`}
      className={onDark ? 'inline-block rounded-lg bg-white px-3 py-2' : 'inline-block'}
    >
      <Image src="/safonix-logo.svg" alt={name} width={201} height={55} priority className="h-10 w-auto" />
    </Link>
  );
}
