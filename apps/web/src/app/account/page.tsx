import type { Metadata } from 'next';
import { AccountOverview } from '@/components/account/AccountOverview';
import { AccountShell } from '@/components/account/AccountShell';

export const metadata: Metadata = { title: 'My account' };

export default function AccountPage() {
  return (
    <AccountShell title="My account">
      <AccountOverview />
    </AccountShell>
  );
}
