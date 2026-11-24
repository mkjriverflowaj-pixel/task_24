import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="container-page py-28 text-center">
      <p className="text-sm font-bold uppercase tracking-widest text-brand-500">404</p>
      <h1 className="mt-3 text-4xl font-extrabold text-navy-900">Page not found</h1>
      <p className="mt-3 text-muted">The page you are looking for does not exist or has moved.</p>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </section>
  );
}
