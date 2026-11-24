import { addItem } from '@/lib/cart-server';
import { readJson, respond } from '@/lib/cart-route';

export async function POST(request: Request) {
  const body = await readJson(request);
  const variantId = typeof body.variantId === 'string' ? body.variantId : '';
  const qty = Math.min(20, Math.max(1, Math.floor(Number(body.qty) || 1)));
  const metadata = {
    mrp: typeof body.mrp === 'number' ? body.mrp : null,
    unit: typeof body.unit === 'string' ? body.unit : null,
  };
  if (!variantId) return Response.json({ message: 'Choose a product first.' }, { status: 400 });
  return respond(() => addItem(variantId, qty, metadata));
}
