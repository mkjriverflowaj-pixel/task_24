import type { Metadata } from 'next';
import { AccountShell } from '@/components/account/AccountShell';
import { ProfileForm } from '@/components/account/ProfileForm';

export const metadata: Metadata = { title: 'My profile' };

export default function ProfilePage() {
  return (
    <AccountShell title="My profile">
      <ProfileForm />
    </AccountShell>
  );
}
