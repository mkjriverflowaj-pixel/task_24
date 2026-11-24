'use client';

import { useState, type ReactNode } from 'react';

const Tick = () => (
  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const inputClass =
  'peer block w-full rounded-xl border border-line bg-white px-4 pb-2 pt-6 pr-11 text-[15px] text-navy-950 outline-none transition duration-200 placeholder-transparent hover:border-navy-900/30 focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(217,59,52,0.12)] aria-[invalid=true]:border-brand-500 disabled:opacity-60';

type Props = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string | null;
  valid?: boolean;
  type?: string;
  autoComplete?: string;
  inputMode?: 'text' | 'tel' | 'email' | 'numeric';
  maxLength?: number;
  disabled?: boolean;
  autoFocus?: boolean;
  icon?: ReactNode;
};

/** Floating-label field in the same style as the contact form. Password fields get a show / hide eye instead of the green tick. */
export function AuthField({ id, label, value, onChange, onBlur, error = null, valid = false, type = 'text', autoComplete, inputMode, maxLength, disabled, autoFocus, icon }: Props) {
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password';

  return (
    <div>
      <div className="group relative">
        {icon && <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted transition-colors group-focus-within:text-brand-500">{icon}</span>}
        <input
          id={id}
          name={id}
          type={isPassword && shown ? 'text' : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          placeholder=" "
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={`${id}-error`}
          className={`${inputClass} ${icon ? 'pl-11' : ''}`}
        />
        <label
          htmlFor={id}
          className={`pointer-events-none absolute top-[1.1rem] origin-left text-sm text-muted transition-all duration-200 group-focus-within:-translate-y-3 group-focus-within:scale-[0.78] group-focus-within:font-semibold group-focus-within:text-brand-500 peer-[:not(:placeholder-shown)]:-translate-y-3 peer-[:not(:placeholder-shown)]:scale-[0.78] ${icon ? 'left-11' : 'left-4'}`}
        >
          {label}
        </label>
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShown((current) => !current)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
            className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition hover:bg-brand-50 hover:text-brand-500 focus-visible:outline-2 focus-visible:outline-brand-500"
          >
            {shown ? (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 3l18 18M10.6 6.2A9.8 9.8 0 0 1 12 6c5 0 9 6 9 6a15 15 0 0 1-3.2 3.7M6.6 7.6A15 15 0 0 0 3 12s4 6 9 6a9.6 9.6 0 0 0 4-.9M9.9 9.9a3 3 0 0 0 4.2 4.2" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6-9-6-9-6Z" />
                <circle cx="12" cy="12" r="2.8" />
              </svg>
            )}
          </button>
        ) : (
          <span
            className={`absolute right-3 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full bg-emerald-500 text-white transition duration-300 ${valid ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            aria-hidden="true"
          >
            <Tick />
          </span>
        )}
        <span className="pointer-events-none absolute inset-x-3 bottom-0 h-0.5 origin-left scale-x-0 rounded bg-brand-500 transition-transform duration-300 group-focus-within:scale-x-100" aria-hidden="true" />
      </div>
      <p id={`${id}-error`} role="alert" className={`overflow-hidden text-xs font-medium text-brand-500 transition-all duration-300 ${error ? 'mt-1.5 max-h-6 opacity-100' : 'max-h-0 opacity-0'}`}>
        {error}
      </p>
    </div>
  );
}

export const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 10 digits starting 6-9, optionally with the country code 91. */
export const phonePattern = /^(\+?91)?[6-9]\d{9}$/;

export function Spinner() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 animate-spin" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/** Small note under the forms while there is no backend. Delete the usages when real sign-in is connected. */
export function PreviewNote() {
  return <p className="mt-5 text-center text-xs text-muted">Design preview: this form is not connected to a server yet.</p>;
}
