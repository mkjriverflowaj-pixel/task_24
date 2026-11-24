import { getSession, toAccount, updateProfile } from '@/lib/account-server';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ user: null }, { status: 401, headers: { 'cache-control': 'no-store' } });
  return Response.json({ user: toAccount(session.user) }, { headers: { 'cache-control': 'no-store' } });
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ message: 'Please sign in again.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const text = (key: string, max = 120) => (typeof body?.[key] === 'string' ? (body[key] as string).trim().slice(0, max) : '');
  const result = await updateProfile(session, { name: text('name'), phone: text('phone', 20), city: text('city'), code: text('code', 30) });
  if (!result.ok) return Response.json({ message: result.message }, { status: 400 });
  return Response.json({ user: result.account });
}
