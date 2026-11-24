import { clearTokens } from '@/lib/account-server';

export async function POST() {
  await clearTokens();
  return Response.json({ ok: true });
}
