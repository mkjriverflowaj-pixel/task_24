import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrderConfirmation } from '@/components/store/OrderConfirmation';

export const metadata: Metadata = { title: 'Order placed', robots: { index: false } };

export default function OrderConfirmationPage() {
  return (
    <section className="py-10 lg:py-14">
      <div className="container-page max-w-3xl">
        <Suspense fallback={null}>
          <OrderConfirmation />
        </Suspense>
      </div>
    </section>
  );
}
