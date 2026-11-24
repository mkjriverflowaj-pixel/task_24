'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { emptyCart, type CartData } from '@/lib/cart-types';
import { money } from '@/lib/format';
import { useAccount } from '@/lib/session';
import { Summary } from './CartView';
import { useStore, type Customer } from './StoreProvider';

const empty: Customer = { name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' };
// Only cash on delivery works for now; online payment needs a payment provider connected to Medusa.
const PAYMENTS = [
  ['cod', 'Cash on delivery', 'Pay when the order arrives', true],
  ['upi', 'UPI', 'Coming soon', false],
  ['card', 'Credit / debit card', 'Coming soon', false],
] as const;

function validate(c: Customer) {
  const errors: Partial<Record<keyof Customer, string>> = {};
  if (c.name.trim().length < 2) errors.name = 'Enter your full name';
  if (!/^\S+@\S+\.\S+$/.test(c.email)) errors.email = 'Enter a valid email';
  if (!/^[6-9]\d{9}$/.test(c.phone)) errors.phone = 'Enter a 10-digit mobile number';
  if (c.address.trim().length < 6) errors.address = 'Enter your address';
  if (c.city.trim().length < 2) errors.city = 'Enter your city';
  if (c.state.trim().length < 2) errors.state = 'Enter your state';
  if (!/^\d{6}$/.test(c.pincode)) errors.pincode = 'Enter a 6-digit pincode';
  return errors;
}

export function CheckoutForm() {
  const { ready, items, setCart } = useStore();
  const { user, signedIn } = useAccount();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>(empty);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [payment, setPayment] = useState<(typeof PAYMENTS)[number][0]>('cod');
  const [errors, setErrors] = useState<Partial<Record<keyof Customer, string>>>({});
  const [step, setStep] = useState<'address' | 'payment'>('address');

  const goTo = (next: 'address' | 'payment') => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // A signed-in shopper starts with their own details filled in.
  useEffect(() => {
    if (!signedIn) return;
    setCustomer((current) => (current.email ? current : { ...current, name: user.name, email: user.email, phone: user.phone, city: user.city }));
  }, [signedIn, user]);

  async function post(url: string, body?: unknown): Promise<{ ok: boolean; data: Record<string, unknown> }> {
    try {
      const res = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
      return { ok: res.ok, data: (await res.json().catch(() => ({}))) as Record<string, unknown> };
    } catch {
      return { ok: false, data: { message: 'Network problem. Please check your connection and try again.' } };
    }
  }

  if (!ready) return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-surface" aria-hidden="true" />;

  if (items.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-dashed border-line bg-surface px-6 py-16 text-center">
        <p className="text-xl font-bold text-navy-950">Your cart is empty</p>
        <p className="mt-1 text-sm text-muted">Add something to your cart before checking out.</p>
        <Link href="/products" className="btn-primary mt-6">Browse products</Link>
      </div>
    );
  }

  const field = (key: keyof Customer, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, span = '') => (
    <label className={`block text-sm font-semibold text-navy-950 ${span}`}>
      {label}
      <input
        value={customer[key]}
        onChange={(event) => setCustomer({ ...customer, [key]: event.target.value })}
        aria-invalid={Boolean(errors[key])}
        className={`mt-1.5 h-11 w-full rounded-xl border bg-surface px-4 text-sm font-normal text-navy-950 outline-none transition focus:border-brand-500 ${errors[key] ? 'border-brand-500' : 'border-line'}`}
        {...props}
      />
      {errors[key] && <span className="mt-1 block text-xs font-medium text-brand-500">{errors[key]}</span>}
    </label>
  );

  return (
    <form
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        if (submitting) return;
        const found = validate(customer);
        setErrors(found);
        if (Object.keys(found).length) {
          if (step === 'payment') goTo('address');
          return;
        }
        setServerError('');
        setSubmitting(true);
        // Step 1 saves the address and picks delivery in Medusa; the order is placed from step 2.
        if (step === 'address') {
          const { ok, data } = await post('/api/checkout/address', customer);
          setSubmitting(false);
          if (!ok) return setServerError(String(data.message ?? 'We could not save your details.'));
          setCart(data as unknown as CartData);
          goTo('payment');
          return;
        }
        const { ok, data } = await post('/api/checkout/complete');
        if (!ok) {
          setSubmitting(false);
          return setServerError(String(data.message ?? 'We could not place your order.'));
        }
        router.push(`/order-confirmation?id=${encodeURIComponent(String(data.orderId))}`);
        setCart(emptyCart);
      }}
      className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_24rem]"
    >
      <div className="space-y-6">
        <ol className="flex items-center gap-3 text-sm font-semibold" aria-label="Checkout steps">
          {([['address', 'Address'], ['payment', 'Payment']] as const).map(([id, label], index) => {
            const done = id === 'address' && step === 'payment';
            const current = step === id;
            return (
              <li key={id} className="flex items-center gap-3">
                {index > 0 && <span className={`h-px w-10 sm:w-16 ${step === 'payment' ? 'bg-brand-500' : 'bg-line'}`} aria-hidden="true" />}
                <button
                  type="button"
                  disabled={!done}
                  onClick={() => goTo('address')}
                  aria-current={current ? 'step' : undefined}
                  className={`flex items-center gap-2 ${current ? 'text-navy-950' : done ? 'text-brand-500 hover:underline' : 'text-muted'}`}
                >
                  <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${current || done ? 'bg-brand-500 text-white' : 'bg-surface text-muted'}`}>
                    {done ? '✓' : index + 1}
                  </span>
                  {label}
                </button>
              </li>
            );
          })}
        </ol>

        {step === 'address' && (
        <fieldset className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <legend className="px-2 text-lg font-bold text-navy-950">Delivery address</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            {field('name', 'Full name', { autoComplete: 'name' })}
            {field('phone', 'Mobile number', { autoComplete: 'tel', inputMode: 'numeric', maxLength: 10 })}
            {field('email', 'Email', { type: 'email', autoComplete: 'email' }, 'sm:col-span-2')}
            {field('address', 'Address', { autoComplete: 'street-address' }, 'sm:col-span-2')}
            {field('city', 'City', { autoComplete: 'address-level2' })}
            {field('state', 'State', { autoComplete: 'address-level1' })}
            {field('pincode', 'Pincode', { inputMode: 'numeric', maxLength: 6, autoComplete: 'postal-code' })}
          </div>
        </fieldset>
        )}

        {step === 'payment' && (
        <>
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-line bg-white p-5 text-sm">
          <p className="text-muted">
            <b className="block text-navy-950">Delivering to {customer.name}</b>
            {customer.address}, {customer.city}, {customer.state} {customer.pincode}
            <span className="block">{customer.phone} · {customer.email}</span>
          </p>
          <button type="button" onClick={() => goTo('address')} className="shrink-0 text-xs font-semibold text-brand-500 hover:underline">Change</button>
        </div>

        <fieldset className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <legend className="px-2 text-lg font-bold text-navy-950">Payment</legend>
          <div className="mt-2 space-y-3">
            {PAYMENTS.map(([id, label, hint, enabled]) => (
              <label key={id} className={`flex items-center gap-3 rounded-xl border p-4 transition ${enabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-55'} ${payment === id ? 'border-brand-500 bg-brand-50' : enabled ? 'border-line hover:border-brand-500/50' : 'border-line'}`}>
                <input type="radio" name="payment" checked={payment === id} disabled={!enabled} onChange={() => setPayment(id)} className="size-4 accent-[var(--color-brand-500)]" />
                <span className="text-sm"><b className="block text-navy-950">{label}</b><span className="text-muted">{hint}</span></span>
              </label>
            ))}
          </div>
          <p className="mt-4 rounded-lg bg-surface px-4 py-3 text-xs text-muted">You pay when your order arrives. Online payment (UPI and cards) is coming soon.</p>
        </fieldset>
        </>
        )}
      </div>

      <div className="space-y-4 lg:sticky lg:top-28">
        <div className="rounded-2xl border border-line bg-white p-5">
          <h2 className="text-lg font-bold text-navy-950">Your items</h2>
          <ul className="mt-3 divide-y divide-line">
            {items.map((line) => (
              <li key={line.id} className="flex items-center gap-3 py-3">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-[#f6f7fa] to-[#eceef3]">
                  {line.image && <Image src={line.image} alt="" fill sizes="56px" className="object-contain p-1.5" />}
                </span>
                <span className="min-w-0 flex-1 text-sm"><span className="line-clamp-2 font-semibold text-navy-950">{line.name}</span><span className="text-muted">Qty {line.qty}</span></span>
                <span className="text-sm font-bold">{money(line.price * line.qty)}</span>
              </li>
            ))}
          </ul>
          <Link href="/cart" className="mt-1 inline-block text-xs font-semibold text-brand-500 hover:underline">Edit cart</Link>
        </div>
        <Summary>
          {serverError && <p role="alert" className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-500">{serverError}</p>}
          {step === 'address' ? (
            <button key="continue" type="submit" disabled={submitting} className="btn-primary mt-5 w-full disabled:opacity-70">{submitting ? 'Saving…' : 'Continue to payment'}</button>
          ) : (
            <>
              <button key="place" type="submit" disabled={submitting} className="btn-primary mt-5 w-full disabled:opacity-70">{submitting ? 'Placing your order…' : 'Place order'}</button>
              <button type="button" onClick={() => goTo('address')} className="mt-3 w-full text-center text-xs font-semibold text-muted hover:text-brand-500">← Back to address</button>
            </>
          )}
        </Summary>
      </div>
    </form>
  );
}
