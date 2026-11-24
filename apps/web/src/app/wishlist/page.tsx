import type { Metadata } from 'next';
import { ProductCard } from '@/components/ProductCard';
import { WishlistGrid } from '@/components/store/WishlistGrid';
import { getAllProducts } from '@/lib/strapi';

export const metadata: Metadata = { title: 'Wishlist', robots: { index: false } };

export default async function WishlistPage() {
  const products = await getAllProducts();
  const cards = products.map((product) => ({ slug: product.slug, card: <ProductCard product={product} /> }));
  return (
    <section className="py-10 lg:py-14">
      <div className="container-page">
        <h1 className="text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Your wishlist</h1>
        <WishlistGrid cards={cards} />
      </div>
    </section>
  );
}
