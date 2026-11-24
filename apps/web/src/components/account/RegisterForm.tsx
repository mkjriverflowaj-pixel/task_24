'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowRight } from '@/components/icons';
import { registerAccount, type AccountType } from '@/lib/session';
import { AuthField, Spinner, emailPattern, phonePattern } from './AuthField';

type Values = { name: string; email: string; phone: string; city: string; code: string; password: string; confirm: string };
type Touched = Partial<Record<keyof Values | 'terms', boolean>>;

const empty: Values = { name: '', email: '', phone: '', city: '', code: '', password: '', confirm: '' };

export function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}
const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const STRENGTH_COLOR = ['bg-line', 'bg-brand-500', 'bg-amber-500', 'bg-lime-500', 'bg-emerald-500'];

const rules: Record<keyof Values, (v: Values) => string | null> = {
  name: (v) => (v.name.trim().length < 2 ? 'Please enter your full name' : null),
  email: (v) => (emailPattern.test(v.email.trim()) ? null : 'Enter a valid email address'),
  phone: (v) => (phonePattern.test(v.phone) ? null : 'Enter a 10-digit mobile number'),
  city: (v) => (v.city.trim().length < 2 ? 'Enter your city' : null),
  code: () => null,
  password: (v) => (v.password.length < 8 ? 'Use at least 8 characters' : null),
  confirm: (v) => (v.confirm !== v.password || !v.confirm ? 'Passwords do not match' : null),
};

/** The fields each step asks for, so "Continue" only checks the step you are on. */
const STEPS: { label: string; title: string; fields: (keyof Values)[] }[] = [
  { label: 'Account', title: 'What describes you best?', fields: [] },
  { label: 'You', title: 'Tell us about yourself', fields: ['name', 'email', 'phone'] },
  { label: 'Location', title: 'Where are you based?', fields: ['city', 'code'] },
  { label: 'Security', title: 'Secure your account', fields: ['password', 'confirm'] },
];

const typeCards: { type: AccountType; text: string; icon: ReactNode }[] = [
  { type: 'Dealer', text: 'I sell Safonix products in my shop', icon: <path d="M3 9.5 5 4h14l2 5.5M3 9.5h18M3 9.5V20h18V9.5M9 20v-6h6v6" /> },
  {
    type: 'Distributor',
    text: 'I supply Safonix products to dealers',
    icon: (
      <>
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
        <circle cx="7" cy="17.5" r="1.8" />
        <circle cx="17" cy="17.5" r="1.8" />
      </>
    ),
  },
  {
    type: 'Electrician',
    text: 'I install Safonix products',
    icon: <path d="M13 3 5 13.5h6L10 21l8-10.5h-6L13 3Z" />,
  },
];

const CODE_HINT: Record<AccountType, string> = {
  Dealer: 'Your distributor gives you this unique code. Enter it to link your account to them.',
  Distributor: 'If Safonix has given you a distributor code, enter it here. No code yet? You can skip this.',
  Electrician: 'If a dealer or distributor gave you a unique code, enter it here. No code? You can skip this.',
};

const checkPath = <path d="m5 12.5 4.5 4.5L19 7.5" />;

/** Progress bar for the four steps. Finished steps are buttons, so people can jump back to fix something. */
function Stepper({ step, goTo }: { step: number; goTo: (index: number) => void }) {
  return (
    <div className="mb-6">
      <ol className="flex gap-2 sm:gap-3" aria-label="Registration progress">
        {STEPS.map((item, index) => {
          const done = index < step;
          const current = index === step;
          return (
            <li key={item.label} className="flex-1">
              <button
                type="button"
                onClick={() => done && goTo(index)}
                disabled={!done}
                aria-current={current ? 'step' : undefined}
                aria-label={`Step ${index + 1}: ${item.label}${done ? ' (completed, go back)' : ''}`}
                className="group block w-full text-left disabled:cursor-default"
              >
                {/* A dash per step: it fills as you get there. */}
                <span className="block h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
                  <span className="block h-full origin-left rounded-full bg-brand-500 transition-transform duration-500" style={{ transform: `scaleX(${done || current ? 1 : 0})` }} />
                </span>
                <span className={`mt-2 hidden text-[11px] font-bold uppercase tracking-wide transition-colors sm:block ${current ? 'text-navy-950' : done ? 'text-brand-500 group-hover:underline' : 'text-muted'}`}>{item.label}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-brand-500" aria-live="polite">
        Step {step + 1} of {STEPS.length}
      </p>
      <h2 className="mt-1 text-xl font-bold text-navy-950">{STEPS[step].title}</h2>
    </div>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'next' | 'back'>('next');
  const [values, setValues] = useState<Values>(empty);
  const [type, setType] = useState<AccountType>('Dealer');
  const [terms, setTerms] = useState(false);
  const [touched, setTouched] = useState<Touched>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(0);
  const [serverError, setServerError] = useState('');
  const top = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  const isLast = step === STEPS.length - 1;
  const error = (key: keyof Values) => (touched[key] ? rules[key](values) : null);
  const valid = (key: keyof Values) => values[key].trim() !== '' && !rules[key](values);
  const set = (key: keyof Values) => (value: string) => setValues((current) => ({ ...current, [key]: key === 'phone' ? value.replace(/[^\d+]/g, '').replace(/(?!^)\+/g, '') : value }));
  const blur = (key: keyof Values) => () => setTouched((current) => ({ ...current, [key]: true }));
  const score = passwordScore(values.password);
  const termsError = touched.terms && !terms ? 'Please accept the terms to continue' : null;

  // After the first step change, bring the top of the form back into view on small screens.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ block: 'start' });
  }, [step]);

  function goTo(index: number) {
    setDirection(index > step ? 'next' : 'back');
    setStep(index);
  }

  function stepErrors() {
    return STEPS[step].fields.filter((key) => rules[key](values));
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (loading || done) return;

    const bad = stepErrors();
    if (isLast && !terms) setTouched((current) => ({ ...current, terms: true }));
    if (bad.length || (isLast && !terms)) {
      setTouched((current) => ({ ...current, ...Object.fromEntries(STEPS[step].fields.map((key) => [key, true])) }));
      setShake((count) => count + 1);
      return;
    }
    if (!isLast) {
      goTo(step + 1);
      return;
    }

    setLoading(true);
    setServerError('');
    void registerAccount({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.replace(/^\+?91/, ''),
      city: values.city.trim(),
      code: values.code.trim(),
      accountType: type,
      password: values.password,
    }).then((result) => {
      setLoading(false);
      if (!result.ok) {
        setServerError(result.message);
        setShake((count) => count + 1);
        return;
      }
      setDone(true);
      setTimeout(() => router.push('/account'), 1500);
    });
  }

  if (done) {
    return (
      <div className="py-8 text-center" role="status">
        <span className="success-pop mx-auto grid size-20 place-items-center rounded-full bg-emerald-50 text-emerald-500 ring-8 ring-emerald-50/60">
          <svg viewBox="0 0 24 24" className="size-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path className="check-draw" d="m5 12.5 4.5 4.5L19 7.5" />
          </svg>
        </span>
        <h2 className="hero-in mt-6 text-2xl font-bold text-navy-950">Welcome, {values.name.trim().split(' ')[0]}!</h2>
        <p className="hero-in mx-auto mt-2 max-w-xs text-muted [animation-delay:120ms]">Your account is ready. Taking you to your dashboard…</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate aria-label="Create your account">
      <div ref={top} className="scroll-mt-28">
        <Stepper step={step} goTo={goTo} />
      </div>

      <div key={step} className={`space-y-4 ${direction === 'next' ? 'step-next' : 'step-back'}`}>
        {step === 0 && (
          <fieldset>
            <legend className="sr-only">Account type</legend>
            <div className="space-y-3">
              {typeCards.map((card) => (
                <label key={card.type} className="block cursor-pointer">
                  <input type="radio" name="account-type" value={card.type} checked={type === card.type} onChange={() => setType(card.type)} className="peer sr-only" />
                  <span className="group flex items-center gap-4 rounded-2xl border border-line bg-white px-4 py-3.5 transition duration-200 hover:border-brand-500/50 peer-checked:border-brand-500 peer-checked:bg-brand-50 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500 active:scale-[0.99]">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-xl transition duration-300 ${type === card.type ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-500 group-hover:bg-brand-500 group-hover:text-white'}`}>
                      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        {card.icon}
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-tight text-navy-950">{card.type}</span>
                      <span className="block text-sm text-muted">{card.text}</span>
                    </span>
                    <span className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition duration-300 ${type === card.type ? 'border-brand-500 bg-brand-500 text-white' : 'border-line text-transparent'}`} aria-hidden="true">
                      <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                        {checkPath}
                      </svg>
                    </span>
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-4 text-sm text-muted">This helps us set up your account the right way. You can finish in under a minute.</p>
          </fieldset>
        )}

        {step === 1 && (
          <>
            <AuthField id="reg-name" label="Full name" value={values.name} onChange={set('name')} onBlur={blur('name')} error={error('name')} valid={valid('name')} autoComplete="name" maxLength={120} autoFocus />
            <AuthField id="reg-email" label="Email address" type="email" value={values.email} onChange={set('email')} onBlur={blur('email')} error={error('email')} valid={valid('email')} autoComplete="email" />
            <AuthField id="reg-phone" label="Mobile number" type="tel" inputMode="tel" maxLength={13} value={values.phone} onChange={set('phone')} onBlur={blur('phone')} error={error('phone')} valid={valid('phone')} autoComplete="tel" />
          </>
        )}

        {step === 2 && (
          <>
            <AuthField id="reg-city" label="City" value={values.city} onChange={set('city')} onBlur={blur('city')} error={error('city')} valid={valid('city')} autoComplete="address-level2" autoFocus />
            <div>
              <AuthField id="reg-code" label="Distributor code (optional)" value={values.code} onChange={set('code')} valid={valid('code')} maxLength={30} />
              <p className="mt-2 text-xs text-muted">
                {CODE_HINT[type]}
              </p>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <AuthField id="reg-password" label="Password" type="password" value={values.password} onChange={set('password')} onBlur={blur('password')} error={error('password')} autoComplete="new-password" autoFocus />
              <div className="mt-2" aria-live="polite">
                <div className="flex gap-1.5" aria-hidden="true">
                  {[1, 2, 3, 4].map((bar) => (
                    <span key={bar} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${values.password && score >= bar ? STRENGTH_COLOR[score] : 'bg-line'}`} />
                  ))}
                </div>
                <p className="mt-1 text-xs text-muted">{values.password ? `Password strength: ${STRENGTH[score]}` : 'Use 8+ characters with letters, numbers and a symbol'}</p>
              </div>
            </div>
            <AuthField id="reg-confirm" label="Confirm password" type="password" value={values.confirm} onChange={set('confirm')} onBlur={blur('confirm')} error={error('confirm')} autoComplete="new-password" />

            <div className="rounded-xl border border-dashed border-line bg-surface p-3.5 text-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">Your details</p>
              <p className="mt-1 text-navy-950">
                <strong>{values.name.trim()}</strong> · {type} · {values.city.trim()}
              </p>
              <p className="text-muted">{values.email.trim()}</p>
            </div>

            <div>
              <label className="group flex cursor-pointer items-start gap-2.5 text-sm text-navy-900">
                <input type="checkbox" checked={terms} onChange={(event) => { setTerms(event.target.checked); setTouched((t) => ({ ...t, terms: true })); }} className="peer sr-only" />
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-line bg-white text-transparent transition duration-200 group-hover:border-brand-500 peer-checked:border-brand-500 peer-checked:bg-brand-500 peer-checked:text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-500">
                  <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {checkPath}
                  </svg>
                </span>
                <span>
                  I agree to the{' '}
                  <Link href="/terms-and-conditions" className="font-semibold text-brand-500 hover:opacity-80">Terms and Conditions</Link> and the{' '}
                  <Link href="/privacy-policy" className="font-semibold text-brand-500 hover:opacity-80">Privacy Policy</Link>.
                </span>
              </label>
              <p role="alert" className={`overflow-hidden pl-7 text-xs font-medium text-brand-500 transition-all duration-300 ${termsError ? 'mt-1.5 max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>{termsError}</p>
            </div>
          </>
        )}
      </div>

      {serverError && <p role="alert" className="mt-4 rounded-lg bg-brand-50 px-4 py-3 text-sm font-medium text-brand-500">{serverError}</p>}

      <div className="mt-6 flex items-center gap-3">
        {step > 0 && (
          <button type="button" onClick={() => goTo(step - 1)} disabled={loading} className="group inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 text-sm font-semibold text-navy-900 transition hover:border-brand-500 hover:text-brand-500 active:scale-95 disabled:opacity-50">
            <svg viewBox="0 0 24 24" className="size-4 transition-transform duration-300 group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            Back
          </button>
        )}
        <button key={`${step}-${shake}`} type="submit" disabled={loading} className={`btn-primary group flex-1 py-3.5 text-base disabled:cursor-wait disabled:opacity-90 ${shake ? 'shake' : ''}`}>
          {loading ? (
            <>
              <Spinner />
              Creating your account…
            </>
          ) : (
            <>
              {isLast ? 'Create account' : 'Continue'}
              <ArrowRight className="size-5" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
