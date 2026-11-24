import { NextResponse } from 'next/server';

const BASE = process.env.STRAPI_URL ?? 'http://localhost:1337';
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Receives the contact form and stores it in Strapi (Content Manager → Contact Submission). */
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  // Hidden field that real visitors never fill in: if a bot did, pretend it worked and store nothing.
  if (typeof body.website === 'string' && body.website.trim() !== '') return NextResponse.json({ ok: true });

  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim();
  const phone = String(body.phone ?? '').trim();
  const company = String(body.company ?? '').trim().slice(0, 120);
  const inquiry = String(body.inquiry ?? '').trim().slice(0, 60);
  const message = String(body.message ?? '').trim();

  if (!name || name.length > 120) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 });
  if (!emailPattern.test(email)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  if (phone && !/^(\+?91)?\d{10}$/.test(phone)) return NextResponse.json({ error: 'Please enter a 10-digit phone number.' }, { status: 400 });
  if (message.length < 5 || message.length > 4000) return NextResponse.json({ error: 'Please write a short message.' }, { status: 400 });

  try {
    const res = await fetch(new URL('/api/contact-submissions', BASE), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { name, email, phone: phone || null, company: company || null, inquiry: inquiry || null, message } }),
    });
    if (!res.ok) return NextResponse.json({ error: 'We could not send your message. Please try again.' }, { status: 502 });
  } catch {
    return NextResponse.json({ error: 'We could not reach our server. Please try again shortly.' }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
