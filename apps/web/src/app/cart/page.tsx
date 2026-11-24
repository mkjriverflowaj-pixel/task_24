import type { Metadata } from 'next';
import { CartView } from '@/components/store/CartView';

export const metadata: Metadata = { title: 'Your Cart', robots: { index: false } };

export default function CartPage() {
  return (
    <section className="py-10 lg:py-14">
      <div className="container-page">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Shopping cart</h1>
        <CartView />
      </div>
    </section>
  );
}
