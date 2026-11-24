import { CartError } from '@/lib/cart-server';

/** Runs a cart action and turns its result or error into a JSON response. */
export async function respond<T>(action: () => Promise<T>) {
  try {
    return Response.json(await action(), { headers: { 'cache-control': 'no-store' } });
  } catch (error) {
    if (error instanceof CartError) return Response.json({ message: error.message }, { status: error.status });
    console.error('cart route failed', error);
    return Response.json({ message: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}

export const readJson = async (request: Request) => ((await request.json().catch(() => null)) ?? {}) as Record<string, unknown>;
