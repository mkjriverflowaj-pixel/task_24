import { removeItem, setQuantity } from '@/lib/cart-server';
import { readJson, respond } from '@/lib/cart-route';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const qty = Math.min(20, Math.max(0, Math.floor(Number((await readJson(request)).qty) || 0)));
  return respond(() => setQuantity(id, qty));
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  return respond(() => removeItem(id));
}
