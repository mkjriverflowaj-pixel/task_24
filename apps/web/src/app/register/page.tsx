import type { Metadata } from 'next';
import { AuthShell, SwitchLink } from '@/components/account/AuthShell';
import { RegisterForm } from '@/components/account/RegisterForm';

export const metadata: Metadata = {
  title: 'Create account',
  description: 'Register as a Safonix dealer, distributor or electrician and start earning points and bonuses.',
};

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Join Safonix Smart Link"
      title="Start **earning** today"
      points={['Register as a Dealer, Distributor or Electrician', 'Scan the QR code on Safonix products', 'Earn points and bonuses on every scan']}
      heading="Create your account"
      subheading="It only takes a minute."
      footer={
        <>
          Already registered? <SwitchLink href="/login">Sign in</SwitchLink>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
