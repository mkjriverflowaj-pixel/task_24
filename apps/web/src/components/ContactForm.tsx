'use client';

import { useRef, useState, type FormEvent, type ReactNode } from 'react';

const MAX_MESSAGE = 1000;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 10 digits, optionally with the 2-digit country code 91 (with or without a leading +). */
const phonePattern = /^(\+?91)?\d{10}$/;

type Values = { name: string; email: string; phone: string; company: string; inquiry: string; message: string };

const INQUIRIES = ['Product Enquiry', 'Pricing / Quote', 'Dealership', 'Support / Other'];
type Status = 'idle' | 'sending' | 'success' | 'error';

const rules: Record<keyof Values, (value: string) => string | null> = {
  name: (value) => (value.trim().length < 2 ? 'Please tell us your name' : null),
  email: (value) => (emailPattern.test(value.trim()) ? null : 'Enter a valid email address'),
  phone: (value) => (value && !phonePattern.test(value) ? 'Enter 10 digits (91 may be added as the country code)' : null),
  company: () => null,
  inquiry: () => null,
  message: (value) => (value.trim().length < 5 ? 'Please write a short message' : null),
};

const Tick = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

/** Floating-label field: the label sits inside the box and slides up when the box is focused or filled. */
function Field({
  id,
  label,
  error,
  valid,
  children,
}: {
  id: string;
  label: string;
  error: string | null;
  valid: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="group relative">
        {children}
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-4 top-[1.1rem] origin-left text-sm text-muted transition-all duration-200 group-focus-within:-translate-y-3 group-focus-within:scale-[0.78] group-focus-within:font-semibold group-focus-within:text-brand-500 peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-[0.78]"
        >
          {label}
        </label>
        <span
          className={`absolute right-3 top-3.5 grid size-6 place-items-center rounded-full bg-emerald-500 text-white transition duration-300 ${valid ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
          aria-hidden="true"
        >
          <Tick />
        </span>
        {/* Underline that draws itself from the left while the field is focused. */}
        <span className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 rounded bg-brand-500 transition-transform duration-300 group-focus-within:scale-x-100" aria-hidden="true" />
      </div>
      <p id={`${id}-error`} role="alert" className={`overflow-hidden text-xs font-medium text-brand-500 transition-all duration-300 ${error ? 'mt-1.5 max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        {error}
      </p>
    </div>
  );
}

const inputClass =
  'peer block w-full rounded-xl border border-line bg-white px-4 pb-2 pt-6 pr-11 text-[15px] text-navy-950 outline-none transition duration-200 placeholder-transparent hover:border-navy-900/30 focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(217,59,52,0.12)] aria-[invalid=true]:border-brand-500';

/** Message form: validates as you go, posts to /api/contact (saved in Strapi) and shows a friendly confirmation. */
export function ContactForm() {
  const [values, setValues] = useState<Values>({ name: '', email: '', phone: '', company: '', inquiry: INQUIRIES[0], message: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Values, boolean>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState('');
  const [shake, setShake] = useState(0);
  const honeypot = useRef<HTMLInputElement>(null);

  const errors = (Object.keys(values) as (keyof Values)[]).reduce(
    (all, key) => ({ ...all, [key]: touched[key] ? rules[key](values[key]) : null }),
    {} as Record<keyof Values, string | null>,
  );
  const isValid = (key: keyof Values) => values[key].trim() !== '' && !rules[key](values[key]);
  const set = (key: keyof Values) => (value: string) => setValues((current) => ({ ...current, [key]: value }));
  const blur = (key: keyof Values) => () => setTouched((current) => ({ ...current, [key]: true }));

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (status === 'sending') return;
    const invalid = (Object.keys(values) as (keyof Values)[]).some((key) => rules[key](values[key]));
    if (invalid) {
      setTouched({ name: true, email: true, phone: true, message: true });
      setShake((count) => count + 1);
      return;
    }
    setStatus('sending');
    setServerError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot.current?.value ?? '' }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? 'Something went wrong. Please try again.');
      }
      setStatus('success');
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setStatus('error');
      setShake((count) => count + 1);
    }
  }

  function reset() {
    setValues({ name: '', email: '', phone: '', company: '', inquiry: INQUIRIES[0], message: '' });
    setTouched({});
    setStatus('idle');
  }

  if (status === 'success') {
    return (
      <div className="grid min-h-[26rem] place-items-center text-center" role="status">
        <div>
          <span className="success-pop mx-auto grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50/60">
            <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path className="check-draw" d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h3 className="hero-in mt-6 text-2xl font-bold text-navy-950">Thank you, {values.name.trim().split(' ')[0]}!</h3>
          <p className="hero-in mx-auto mt-2 max-w-xs text-muted [animation-delay:120ms]">Your message has reached our team. We will get back to you soon on the email you gave.</p>
          <button type="button" onClick={reset} className="hero-in mt-6 rounded-full border border-brand-500/40 px-5 py-2 text-sm font-semibold text-brand-500 transition [animation-delay:240ms] hover:bg-brand-500 hover:text-white active:scale-95">
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-label="Send us a message">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cf-name" label="Your name" error={errors.name} valid={isValid('name')}>
          <input id="cf-name" name="name" autoComplete="name" placeholder=" " maxLength={120} value={values.name} onChange={(e) => set('name')(e.target.value)} onBlur={blur('name')} aria-invalid={Boolean(errors.name)} aria-describedby="cf-name-error" className={inputClass} />
        </Field>
        <Field id="cf-email" label="Email address" error={errors.email} valid={isValid('email')}>
          <input id="cf-email" name="email" type="email" autoComplete="email" placeholder=" " value={values.email} onChange={(e) => set('email')(e.target.value)} onBlur={blur('email')} aria-invalid={Boolean(errors.email)} aria-describedby="cf-email-error" className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="cf-phone" label="Phone (optional)" error={errors.phone} valid={isValid('phone')}>
          <input id="cf-phone" name="phone" type="tel" autoComplete="tel" placeholder=" " inputMode="tel" maxLength={13} value={values.phone} onChange={(e) => set('phone')(e.target.value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, ''))} onBlur={blur('phone')} aria-invalid={Boolean(errors.phone)} aria-describedby="cf-phone-error" className={inputClass} />
        </Field>
        <Field id="cf-company" label="Company (optional)" error={null} valid={isValid('company')}>
          <input id="cf-company" name="company" autoComplete="organization" placeholder=" " maxLength={120} value={values.company} onChange={(e) => set('company')(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <fieldset>
        <legend className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-navy-950">Type of enquiry</legend>
        <div className="flex flex-wrap gap-2">
          {INQUIRIES.map((option) => (
            <label key={option} className="cursor-pointer">
              <input type="radio" name="inquiry" value={option} checked={values.inquiry === option} onChange={() => set('inquiry')(option)} className="peer sr-only" />
              <span className="inline-block rounded-full border border-line bg-white px-4 py-2 text-[13px] font-semibold text-navy-900 transition duration-200 hover:-translate-y-0.5 hover:border-brand-500/50 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-checked:text-brand-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 active:scale-95">
                {option}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <div>
        <Field id="cf-message" label="How can we help you?" error={errors.message} valid={isValid('message')}>
          <textarea id="cf-message" name="message" rows={4} placeholder=" " maxLength={MAX_MESSAGE} value={values.message} onChange={(e) => set('message')(e.target.value)} onBlur={blur('message')} aria-invalid={Boolean(errors.message)} aria-describedby="cf-message-error" className={`${inputClass} resize-none`} />
        </Field>
      </div>

      {/* Honeypot: hidden from people, tempting for bots. */}
      <input ref={honeypot} type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      {status === 'error' && (
        <p role="alert" className="rounded-xl border border-brand-500/30 bg-brand-50 px-4 py-3 text-sm font-medium text-brand-500">
          {serverError}
        </p>
      )}

      <button
        key={shake}
        type="submit"
        disabled={status === 'sending'}
        className={`btn-primary group w-full py-3.5 text-base disabled:cursor-wait disabled:opacity-90 ${shake ? 'shake' : ''}`}
      >
        {status === 'sending' ? (
          <>
            <svg viewBox="0 0 24 24" className="size-5 animate-spin" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            Sending…
          </>
        ) : (
          <>
            Send Message
            <svg viewBox="0 0 24 24" className="size-5 transition duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
