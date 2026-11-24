import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/store/CheckoutForm';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <section className="py-10 lg:py-14">
      <div className="container-page">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Checkout</h1>
        <CheckoutForm />
      </div>
    </section>
  );
}
