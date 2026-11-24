'use client';

import { useEffect, useReducer } from 'react';

/**
 * The signed-in customer, from Strapi's built-in users (Users & Permissions) through the website's /api/auth routes.
 * The tokens live in httpOnly cookies; this file only keeps the profile for the page to show.
 */
export type AccountType = 'Dealer' | 'Distributor' | 'Electrician';

export type Account = {
  name: string;
  email: string;
  phone: string;
  city: string;
  accountType: AccountType;
  code: string;
  joined: string;
};

/** What pages show while nobody is signed in: all empty, no made-up person. */
export const emptyAccount: Account = { name: '', email: '', phone: '', city: '', accountType: 'Dealer', code: '', joined: '' };

type Result = { ok: true } | { ok: false; message: string };

// undefined = not loaded yet, null = signed out
let current: Account | null | undefined;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

const publish = (next: Account | null) => {
  current = next;
  listeners.forEach((listener) => listener());
};

function load(force = false) {
  if (loading && !force) return loading;
  loading = fetch('/api/auth/me', { cache: 'no-store' })
    .then(async (res) => publish(res.ok ? ((await res.json()) as { user: Account }).user : null))
    .catch(() => publish(null))
    .finally(() => {
      loading = null;
    });
  return loading;
}

async function send(url: string, method: string, body?: unknown): Promise<{ ok: boolean; data: { message?: string; user?: Account } }> {
  try {
    const res = await fetch(url, { method, headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const data = (await res.json().catch(() => ({}))) as { message?: string; user?: Account };
    return { ok: res.ok, data };
  } catch {
    return { ok: false, data: { message: 'Network problem. Please check your connection and try again.' } };
  }
}

const fail = (data: { message?: string }): Result => ({ ok: false, message: data.message ?? 'Something went wrong. Please try again.' });

export async function signIn(email: string, password: string): Promise<Result> {
  const { ok, data } = await send('/api/auth/login', 'POST', { email, password });
  if (!ok || !data.user) return fail(data);
  publish(data.user);
  return { ok: true };
}

export async function registerAccount(values: { name: string; email: string; phone: string; city: string; code: string; accountType: AccountType; password: string }): Promise<Result> {
  const { ok, data } = await send('/api/auth/register', 'POST', values);
  if (!ok || !data.user) return fail(data);
  publish(data.user);
  return { ok: true };
}

export async function signOut() {
  await send('/api/auth/logout', 'POST');
  publish(null);
}

export async function updateProfile(values: { name: string; email: string; phone: string; city: string; code: string }): Promise<Result> {
  const { ok, data } = await send('/api/auth/me', 'PUT', values);
  if (!ok || !data.user) return fail(data);
  publish(data.user);
  return { ok: true };
}

export async function changePassword(currentPassword: string, nextPassword: string): Promise<Result> {
  const { ok, data } = await send('/api/auth/password', 'POST', { current: currentPassword, next: nextPassword });
  return ok ? { ok: true } : fail(data);
}

/** The signed-in customer. `ready` turns true once we know whether anyone is signed in. */
export function useAccount() {
  const [, rerender] = useReducer((count: number) => count + 1, 0);

  useEffect(() => {
    listeners.add(rerender);
    if (current === undefined) void load();
    return () => {
      listeners.delete(rerender);
    };
  }, []);

  return { user: current ?? emptyAccount, signedIn: Boolean(current), ready: current !== undefined };
}

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || 'S';
