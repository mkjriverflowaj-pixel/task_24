import { login } from '@/lib/account-server';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: string; password?: string } | null;
  if (!body?.email || !body.password) return Response.json({ message: 'Enter your email and password.' }, { status: 400 });
  const result = await login(body.email, body.password);
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status === 429 ? 429 : 401 });
  return Response.json({ user: result.account });
}
