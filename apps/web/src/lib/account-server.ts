import { cookies } from 'next/headers';
import type { Account, AccountType } from './session';

/**
 * Server side of customer accounts. People are Medusa customers: the website's /api/auth routes call Medusa's auth and
 * store APIs, and keep the login token in an httpOnly cookie so the browser JavaScript never sees it.
 *
 *   register -> POST /auth/customer/customer-emailpass/register, then POST /store/customers (the profile)
 *   login    -> POST /auth/customer/customer-emailpass (customers have their own login, separate from the admin one)
 *   profile  -> GET / POST /store/customers/me
 *   password -> POST /store/customers/me/password (a custom route in apps/backend)
 *
 * Account type, city and distributor code are kept in the customer's metadata.
 */
const MEDUSA = process.env.MEDUSA_URL ?? 'http://localhost:9000';
const KEY = process.env.MEDUSA_PUBLISHABLE_KEY ?? '';
const TOKEN = 'sx_at';
const ACCOUNT_TYPES: AccountType[] = ['Dealer', 'Distributor', 'Electrician'];

type Customer = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at?: string;
};

const meta = (customer: Customer, key: string) => (typeof customer.metadata?.[key] === 'string' ? (customer.metadata[key] as string) : '');

export const toAccount = (customer: Customer): Account => ({
  name: [customer.first_name, customer.last_name].filter(Boolean).join(' '),
  email: customer.email,
  phone: customer.phone ?? '',
  city: meta(customer, 'city'),
  accountType: ACCOUNT_TYPES.includes(meta(customer, 'account_type') as AccountType) ? (meta(customer, 'account_type') as AccountType) : 'Dealer',
  code: meta(customer, 'distributor_code'),
  joined: customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '',
});

const call = (path: string, init: { method?: string; body?: unknown; token?: string } = {}) =>
  fetch(`${MEDUSA}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      'x-publishable-api-key': KEY,
      ...(init.token ? { authorization: `Bearer ${init.token}` } : {}),
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });

const errorMessage = async (res: Response, fallback: string) => {
  const data = (await res.json().catch(() => null)) as { message?: string } | null;
  return data?.message || fallback;
};

const UNREACHABLE = 'We could not reach the account service. Please try again in a moment.';

async function saveToken(token: string) {
  const jar = await cookies();
  jar.set(TOKEN, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 14 });
  // Cookies from the earlier Strapi-based sign-in are no longer used.
  for (const old of ['sx_rt', 'sx_rt_sig']) jar.delete(old);
}

export async function clearTokens() {
  const jar = await cookies();
  for (const name of [TOKEN, 'sx_rt', 'sx_rt_sig']) jar.delete(name);
}

async function fetchMe(token: string): Promise<Customer | null> {
  try {
    const res = await call('/store/customers/me', { token });
    return res.ok ? ((await res.json()) as { customer: Customer }).customer : null;
  } catch {
    return null;
  }
}

type Result = { ok: true; account: Account } | { ok: false; message: string; status: number };

/** Signs in with Medusa and stores the token cookie. */
export async function login(email: string, password: string): Promise<Result> {
  let res: Response;
  try {
    res = await call('/auth/customer/customer-emailpass', { method: 'POST', body: { email: email.trim().toLowerCase(), password } });
  } catch {
    return { ok: false, message: UNREACHABLE, status: 503 };
  }
  if (!res.ok) {
    return { ok: false, message: res.status === 429 ? 'Too many attempts. Please wait a minute and try again.' : 'Incorrect email or password.', status: res.status };
  }
  let { token } = (await res.json()) as { token?: string };
  if (!token) return { ok: false, message: 'Sign in failed.', status: 502 };
  let customer = await fetchMe(token);
  if (!customer) {
    // The login is valid but has no shopper profile yet (for example an email first made as a Medusa admin, or a sign-up that
    // stopped half way). Create an empty profile for it, then sign in again so the new token carries the profile.
    const created = await call('/store/customers', { method: 'POST', token, body: { email: email.trim().toLowerCase() } });
    if (created.ok) {
      const again = await call('/auth/customer/customer-emailpass', { method: 'POST', body: { email: email.trim().toLowerCase(), password } });
      token = again.ok ? ((await again.json()) as { token?: string }).token : undefined;
      customer = token ? await fetchMe(token) : null;
    }
  }
  if (!customer || !token) return { ok: false, message: 'Your login works, but we could not open your profile. Please contact support.', status: 404 };
  await saveToken(token);
  return { ok: true, account: toAccount(customer) };
}

export async function register(fields: Record<string, string>): Promise<Result> {
  const email = fields.email.trim().toLowerCase();
  const [first, ...rest] = fields.name.trim().split(/\s+/);
  try {
    const auth = await call('/auth/customer/customer-emailpass/register', { method: 'POST', body: { email, password: fields.password } });
    if (!auth.ok) {
      const message = await errorMessage(auth, 'We could not create your account.');
      return { ok: false, message: /already exists/i.test(message) ? 'An account with this email already exists. Try signing in.' : message, status: auth.status };
    }
    const { token } = (await auth.json()) as { token: string };

    const created = await call('/store/customers', {
      method: 'POST',
      token,
      body: {
        email,
        first_name: first,
        last_name: rest.join(' ') || undefined,
        phone: fields.phone || undefined,
        metadata: { account_type: fields.accountType, city: fields.city, distributor_code: fields.code },
      },
    });
    if (!created.ok) return { ok: false, message: await errorMessage(created, 'We could not save your profile.'), status: created.status };
  } catch {
    return { ok: false, message: UNREACHABLE, status: 503 };
  }
  // Sign in straight away so the cookie is set the same way as a normal login.
  return login(email, fields.password);
}

/** The signed-in Medusa customer and the token for further calls. */
export async function getSession(): Promise<{ user: Customer; jwt: string } | null> {
  const token = (await cookies()).get(TOKEN)?.value;
  if (!token) return null;
  const customer = await fetchMe(token);
  return customer ? { user: customer, jwt: token } : null;
}

/** Saves name, phone, city and distributor code. The email is the login and cannot be changed here. */
export async function updateProfile(session: { user: Customer; jwt: string }, fields: Record<string, string>): Promise<{ ok: true; account: Account } | { ok: false; message: string }> {
  const [first, ...rest] = fields.name.trim().split(/\s+/);
  const res = await call('/store/customers/me', {
    method: 'POST',
    token: session.jwt,
    body: {
      first_name: first,
      last_name: rest.join(' ') || '',
      phone: fields.phone || undefined,
      metadata: { ...(session.user.metadata ?? {}), city: fields.city, distributor_code: fields.code },
    },
  });
  if (!res.ok) return { ok: false, message: await errorMessage(res, 'We could not save your profile.') };
  return { ok: true, account: toAccount(((await res.json()) as { customer: Customer }).customer) };
}

export async function changePassword(jwt: string, current: string, next: string): Promise<{ ok: true } | { ok: false; message: string }> {
  const res = await call('/store/customers/me/password', { method: 'POST', token: jwt, body: { current_password: current, new_password: next } });
  return res.ok ? { ok: true } : { ok: false, message: await errorMessage(res, 'We could not change your password.') };
}
