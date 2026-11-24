import { register } from '@/lib/account-server';

const TYPES = ['Dealer', 'Distributor', 'Electrician'];

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  const text = (key: string, max = 120) => (typeof body?.[key] === 'string' ? (body[key] as string).trim().slice(0, max) : '');
  const fields = {
    name: text('name'),
    email: text('email'),
    phone: text('phone', 20),
    city: text('city'),
    code: text('code', 30),
    accountType: text('accountType', 20),
    password: typeof body?.password === 'string' ? body.password.slice(0, 128) : '',
  };
  if (fields.name.length < 2 || !/^\S+@\S+\.\S+$/.test(fields.email) || fields.password.length < 8 || !TYPES.includes(fields.accountType)) {
    return Response.json({ message: 'Please check your details and try again.' }, { status: 400 });
  }
  const result = await register(fields);
  if (!result.ok) return Response.json({ message: result.message }, { status: result.status === 429 ? 429 : 400 });
  return Response.json({ user: result.account });
}
