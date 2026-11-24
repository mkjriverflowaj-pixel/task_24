'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowRight } from '@/components/icons';
import { signIn } from '@/lib/session';
import { AuthField, Spinner, emailPattern } from './AuthField';

type Mode = 'login' | 'forgot' | 'sent';

const mailIcon = (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);
const lockIcon = (
  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const validId = (value: string) => emailPattern.test(value.trim());

export function LoginForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState({ id: false, password: false });
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(0);
  const [serverError, setServerError] = useState('');

  const idError = touched.id && !validId(id) ? 'Enter a valid email address' : null;
  const passwordError = touched.password && password.length < 1 ? 'Enter your password' : null;

  function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    if (!validId(id) || (mode === 'login' && !password)) {
      setTouched({ id: true, password: true });
      setShake((count) => count + 1);
      return;
    }
    setLoading(true);
    setServerError('');
    if (mode === 'forgot') {
      // Password reset emails are not set up yet, so this only shows the confirmation.
      setTimeout(() => {
        setLoading(false);
        setMode('sent');
      }, 900);
      return;
    }
    void signIn(id, password).then((result) => {
      if (result.ok) {
        router.push('/account');
        return;
      }
      setLoading(false);
      setServerError(result.message);
      setShake((count) => count + 1);
    });
  }

  if (mode === 'sent') {
    return (
      <div className="py-6 text-center" role="status">
        <span className="success-pop mx-auto grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50/60">
          <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="check-draw" d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2 className="hero-in mt-6 text-xl font-bold text-navy-950">Check your inbox</h2>
        <p className="hero-in mx-auto mt-2 max-w-xs text-sm text-muted [animation-delay:120ms]">If an account exists for that address, a reset link is on its way.</p>
        <button type="button" onClick={() => { setMode('login'); setPassword(''); }} className="hero-in mt-6 rounded-full border border-brand-500/40 px-5 py-2 text-sm font-semibold text-brand-500 transition [animation-delay:240ms] hover:bg-brand-500 hover:text-white active:scale-95">
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4" aria-label={mode === 'login' ? 'Sign in' : 'Reset your password'}>
      <AuthField id="login-id" label="Email address" type="email" value={id} onChange={setId} onBlur={() => setTouched((t) => ({ ...t, id: true }))} error={idError} valid={validId(id)} autoComplete="username" icon={mailIcon} />

      {mode === 'login' && (
        <>
          <AuthField id="login-password" label="Password" type="password" value={password} onChange={setPassword} onBlur={() => setTouched((t) => ({ ...t, password: true }))} error={passwordError} autoComplete="current-password" icon={lockIcon} />
          <div className="flex items-center justify-between gap-3 text-sm">
            <label className="group flex cursor-pointer items-center gap-2.5 text-navy-900">
              <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="peer sr-only" />
              <span className="grid size-5 place-items-center rounded-md border border-line bg-white text-transparent transition duration-200 group-hover:border-brand-500 peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500">
                <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m5 12.5 4.5 4.5L19 7.5" />
                </svg>
              </span>
              Remember me
            </label>
            <button type="button" onClick={() => setMode('forgot')} className="font-semibold text-brand-500 transition hover:opacity-80">
              Forgot password?
            </button>
          </div>
        </>
      )}

      {mode === 'forgot' && <p className="text-sm text-muted">Enter the email you registered with and we will send you a link to set a new password.</p>}
      {serverError && <p role="alert" className="rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-500">{serverError}</p>}

      <button key={shake} type="submit" disabled={loading} className={`btn-primary group w-full py-3.5 text-base disabled:cursor-wait disabled:opacity-90 ${shake ? 'shake' : ''}`}>
        {loading ? (
          <>
            <Spinner />
            {mode === 'login' ? 'Signing in…' : 'Sending…'}
          </>
        ) : (
          <>
            {mode === 'login' ? 'Sign in' : 'Send reset link'}
            <ArrowRight className="size-5" />
          </>
        )}
      </button>

      {mode === 'forgot' && (
        <button type="button" onClick={() => setMode('login')} className="block w-full text-center text-sm font-semibold text-navy-900 transition hover:text-brand-500">
          Back to sign in
        </button>
      )}
    </form>
  );
}
