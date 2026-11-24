import { applyPromo, removePromo } from '@/lib/cart-server';
import { readJson, respond } from '@/lib/cart-route';

export async function POST(request: Request) {
  const code = String((await readJson(request)).code ?? '').trim().slice(0, 40);
  if (!code) return Response.json({ message: 'Enter a code.' }, { status: 400 });
  return respond(() => applyPromo(code));
}

export async function DELETE(request: Request) {
  const code = String((await readJson(request)).code ?? '').trim().slice(0, 40);
  return respond(() => removePromo(code));
}
