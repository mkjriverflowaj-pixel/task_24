import type { Metadata } from 'next';
import { AuthShell, SwitchLink } from '@/components/account/AuthShell';
import { LoginForm } from '@/components/account/LoginForm';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to your Safonix Smart Link account to see your points, bonuses and profile.',
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Safonix Smart Link"
      title="Welcome **back**"
      points={['See your points and bonuses in one place', 'Track every product code you have scanned', 'Redeem rewards from your wallet']}
      heading="Sign in"
      subheading="Enter your details to open your account."
      footer={
        <>
          New to Safonix? <SwitchLink href="/register">Create an account</SwitchLink>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
