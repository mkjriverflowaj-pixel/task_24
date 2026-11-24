import { changePassword, getSession } from '@/lib/account-server';

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return Response.json({ message: 'Please sign in again.' }, { status: 401 });
  const body = (await request.json().catch(() => null)) as { current?: string; next?: string } | null;
  if (!body?.current || !body.next || body.next.length < 8) return Response.json({ message: 'Use at least 8 characters for the new password.' }, { status: 400 });
  const result = await changePassword(session.jwt, body.current, body.next);
  if (!result.ok) return Response.json({ message: result.message }, { status: 400 });
  return Response.json({ ok: true });
}
