import { getOrder } from '@/lib/cart-server';
import { respond } from '@/lib/cart-route';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) return Response.json({ message: 'Order not found.' }, { status: 404 });
  return respond(async () => ({ order }));
}
