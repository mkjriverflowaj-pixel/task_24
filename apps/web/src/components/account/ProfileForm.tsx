'use client';

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { changePassword, updateProfile, useAccount, type Account } from '@/lib/session';
import { AuthField, Spinner, emailPattern, phonePattern } from './AuthField';
import { passwordScore } from './RegisterForm';

type Editable = Pick<Account, 'name' | 'email' | 'phone' | 'city' | 'code'>;

const rules: Record<keyof Editable, (value: string) => string | null> = {
  name: (v) => (v.trim().length < 2 ? 'Please enter your full name' : null),
  email: (v) => (emailPattern.test(v.trim()) ? null : 'Enter a valid email address'),
  phone: (v) => (phonePattern.test(v) ? null : 'Enter a 10-digit mobile number'),
  city: (v) => (v.trim().length < 2 ? 'Enter your city' : null),
  code: () => null,
};

function Card({ title, text, children }: { title: string; text?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-[0_6px_20px_rgba(20,32,46,0.06)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-navy-950">{title}</h2>
          {text && <p className="mt-0.5 text-sm text-muted">{text}</p>}
        </div>
        <span className="mt-2 h-0.5 w-10 shrink-0 bg-brand-500" aria-hidden="true" />
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Toast({ message }: { message: string }) {
  return (
    <div role="status" aria-live="polite" className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition duration-500 ${message ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'}`}>
      <div className="flex items-center gap-3 rounded-full bg-navy-950 py-2.5 pl-2.5 pr-5 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(0,0,0,0.3)]">
        <span className="grid size-7 place-items-center rounded-full bg-emerald-500">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        {message}
      </div>
    </div>
  );
}

function Switch({ checked, onChange, label, text }: { checked: boolean; onChange: (value: boolean) => void; label: string; text: string }) {
  return (
    <label className="group flex cursor-pointer items-center justify-between gap-4 py-3.5">
      <span>
        <span className="block text-[15px] font-semibold text-navy-950">{label}</span>
        <span className="block text-xs text-muted">{text}</span>
      </span>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} className="peer sr-only" />
      <span className="relative h-7 w-12 shrink-0 rounded-full bg-line transition-colors duration-300 peer-checked:bg-brand-500 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 after:absolute after:left-0.5 after:top-0.5 after:size-6 after:rounded-full after:bg-white after:shadow-md after:transition-transform after:duration-300 peer-checked:after:translate-x-5 group-active:after:scale-90" />
    </label>
  );
}

export function ProfileForm() {
  const { user, ready, signedIn } = useAccount();
  const [values, setValues] = useState<Editable>({ name: '', email: '', phone: '', city: '', code: '' });
  const [touched, setTouched] = useState<Partial<Record<keyof Editable, boolean>>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [shake, setShake] = useState(0);
  const loaded = useRef(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Password card
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwTouched, setPwTouched] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // Notification preferences (preview only)
  const [prefs, setPrefs] = useState({ points: true, offers: true, orders: false });

  useEffect(() => {
    if (!ready || loaded.current) return;
    loaded.current = true;
    setValues({ name: user.name, email: user.email, phone: user.phone, city: user.city, code: user.code });
  }, [ready, user]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const showToast = (message: string) => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3200);
  };

  const dirty = (Object.keys(values) as (keyof Editable)[]).some((key) => values[key] !== user[key]);
  const error = (key: keyof Editable) => (touched[key] ? rules[key](values[key]) : null);
  const valid = (key: keyof Editable) => values[key].trim() !== '' && !rules[key](values[key]);
  const set = (key: keyof Editable) => (value: string) => setValues((current) => ({ ...current, [key]: key === 'phone' ? value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '') : value }));
  const blur = (key: keyof Editable) => () => setTouched((current) => ({ ...current, [key]: true }));

  function save(event: FormEvent) {
    event.preventDefault();
    if (saving) return;
    if ((Object.keys(values) as (keyof Editable)[]).some((key) => rules[key](values[key]))) {
      setTouched({ name: true, email: true, phone: true, city: true });
      setShake((count) => count + 1);
      return;
    }
    setSaving(true);
    void updateProfile(values).then((result) => {
      setSaving(false);
      showToast(result.ok ? 'Profile saved' : result.message);
    });
  }

  function discard() {
    setValues({ name: user.name, email: user.email, phone: user.phone, city: user.city, code: user.code });
    setTouched({});
  }

  const pwScore = passwordScore(pw.next);
  const pwErrors = {
    current: pwTouched && !pw.current ? 'Enter your current password' : null,
    next: pwTouched && pw.next.length < 8 ? 'Use at least 8 characters' : null,
    confirm: pwTouched && (!pw.confirm || pw.confirm !== pw.next) ? 'Passwords do not match' : null,
  };

  function updatePassword(event: FormEvent) {
    event.preventDefault();
    if (pwSaving) return;
    if (!pw.current || pw.next.length < 8 || pw.confirm !== pw.next) {
      setPwTouched(true);
      return;
    }
    setPwSaving(true);
    void changePassword(pw.current, pw.next).then((result) => {
      setPwSaving(false);
      if (result.ok) {
        setPw({ current: '', next: '', confirm: '' });
        setPwTouched(false);
      }
      showToast(result.ok ? 'Password updated' : result.message);
    });
  }

  if (!ready) return <div className="h-96 animate-pulse rounded-2xl bg-surface" aria-hidden="true" />;

  return (
    <div className="space-y-6">
      <form onSubmit={save} noValidate aria-label="Personal information">
        <Card title="Personal information" text="These details are used on your account and for Safonix rewards.">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField id="pf-name" label="Full name" value={values.name} onChange={set('name')} onBlur={blur('name')} error={error('name')} valid={valid('name')} autoComplete="name" maxLength={120} />
              <AuthField id="pf-email" label="Email (your login, cannot be changed)" type="email" value={values.email} onChange={set('email')} disabled autoComplete="email" />
              <AuthField id="pf-phone" label="Mobile number" type="tel" inputMode="tel" maxLength={13} value={values.phone} onChange={set('phone')} onBlur={blur('phone')} error={error('phone')} valid={valid('phone')} autoComplete="tel" />
              <AuthField id="pf-city" label="City" value={values.city} onChange={set('city')} onBlur={blur('city')} error={error('city')} valid={valid('city')} autoComplete="address-level2" />
              <AuthField id="pf-code" label="Distributor code" value={values.code} onChange={set('code')} maxLength={30} />
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-line bg-surface px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-brand-500 text-white">
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="5" y="11" width="14" height="9" rx="2" />
                    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-muted">Account type</p>
                  <p className="text-[15px] font-bold text-navy-950">{signedIn ? user.accountType : 'Not set'}</p>
                </div>
                <p className="ml-auto max-w-[9rem] text-right text-[11px] leading-snug text-muted">To change this, contact support.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
              <p className={`mr-auto text-sm text-muted transition-opacity duration-300 ${dirty ? 'opacity-100' : 'opacity-0'}`} aria-live="polite">You have unsaved changes</p>
              <button type="button" onClick={discard} disabled={!dirty || saving} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:border-brand-500 hover:text-brand-500 active:scale-95 disabled:pointer-events-none disabled:opacity-40">
                Discard
              </button>
              <button key={shake} type="submit" disabled={!dirty || saving} className={`btn-primary disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ${shake ? 'shake' : ''}`}>
                {saving ? (
                  <>
                    <Spinner />
                    Saving…
                  </>
                ) : (
                  'Save changes'
                )}
              </button>
            </div>
          </div>
        </Card>
      </form>

      <form onSubmit={updatePassword} noValidate aria-label="Change password">
        <Card title="Change password" text="Choose a strong password you don't use anywhere else.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <AuthField id="pw-current" label="Current password" type="password" value={pw.current} onChange={(v) => setPw((c) => ({ ...c, current: v }))} error={pwErrors.current} autoComplete="current-password" />
            </div>
            <div>
              <AuthField id="pw-new" label="New password" type="password" value={pw.next} onChange={(v) => setPw((c) => ({ ...c, next: v }))} error={pwErrors.next} autoComplete="new-password" />
              <div className="mt-2 flex gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4].map((step) => (
                  <span key={step} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${pw.next && pwScore >= step ? ['', 'bg-brand-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'][pwScore] : 'bg-line'}`} />
                ))}
              </div>
            </div>
            <AuthField id="pw-confirm" label="Confirm new password" type="password" value={pw.confirm} onChange={(v) => setPw((c) => ({ ...c, confirm: v }))} error={pwErrors.confirm} autoComplete="new-password" />
          </div>
          <div className="mt-5 flex justify-end border-t border-line pt-5">
            <button type="submit" disabled={pwSaving} className="btn-primary disabled:cursor-wait disabled:opacity-90">
              {pwSaving ? (
                <>
                  <Spinner />
                  Updating…
                </>
              ) : (
                'Update password'
              )}
            </button>
          </div>
        </Card>
      </form>

      <Card title="Notifications" text="Choose what we tell you about.">
        <div className="divide-y divide-line">
          <Switch checked={prefs.points} onChange={(v) => setPrefs((p) => ({ ...p, points: v }))} label="Points and bonuses" text="When you earn points or unlock a bonus" />
          <Switch checked={prefs.offers} onChange={(v) => setPrefs((p) => ({ ...p, offers: v }))} label="Offers and news" text="New products and reward campaigns" />
          <Switch checked={prefs.orders} onChange={(v) => setPrefs((p) => ({ ...p, orders: v }))} label="Order updates" text="Status of orders placed on this site" />
        </div>
      </Card>

      <p className="text-center text-xs text-muted">Design preview: changes are not saved to a server yet.</p>
      <Toast message={toast} />
    </div>
  );
}
