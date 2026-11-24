import type { ReactNode } from 'react';
import { ArrowRight } from '@/components/icons';
import { StepsStage } from './StepsStage';
import './smart-link.css';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.safonix.app&hl=en_IN';

const stroke = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

const Icon = ({ children, className = 'size-7' }: { children: ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <g {...stroke}>{children}</g>
  </svg>
);

const icons = {
  download: (
    <>
      <path d="M12 4v11m0 0-4-4m4 4 4-4" />
      <path d="M5 19h14" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
    </>
  ),
  box: (
    <>
      <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
      <path d="m4 7 8 4 8-4M12 11v10" />
    </>
  ),
  scan: (
    <>
      <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
      <path d="M4 12h16" />
    </>
  ),
  star: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 7.5 1.4 3 3.1.4-2.3 2.2.6 3.2-2.8-1.6-2.8 1.6.6-3.2-2.3-2.2 3.1-.4 1.4-3Z" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  gift: (
    <>
      <path d="M4 11h16v9H4zM3 7.5h18V11H3zM12 7.5V20" />
      <path d="M12 7.5C10 7.5 8 6.6 8 5a1.8 1.8 0 0 1 3.2-1.1L12 5l.8-1.1A1.8 1.8 0 0 1 16 5c0 1.6-2 2.5-4 2.5Z" />
    </>
  ),
};

const steps: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Install from the Play Store',
    text: 'Open the Google Play Store on your phone, search for “Safonix Smart Link” and tap Install, or use the download button on this page.',
    icon: icons.download,
  },
  {
    title: 'Register as a Dealer, Distributor or Electrician',
    text: 'Open the app and create your account as a Dealer, a Distributor or an Electrician. You will need your email, your phone number and the unique code provided by your distributor or dealer.',
    icon: icons.user,
  },
  {
    title: 'Explore products and offers',
    text: 'Know and explore the latest information on products and offers.',
    icon: icons.box,
  },
  {
    title: 'Scan the code',
    text: 'Scan the QR code on the product packaging with the in-app scanner. Each valid scan is recorded against your account.',
    icon: icons.scan,
  },
  {
    title: 'Earn points and bonuses',
    text: 'Every scan, purchase and sales target you meet adds points and bonuses to your wallet. Redeem them to receive various benefits.',
    icon: icons.star,
  },
];

const highlights = [
  { title: 'Scan', text: 'Scan QR codes on Safonix product packaging.', icon: icons.scan },
  { title: 'Earn', text: 'Collect points and bonuses with every scan, purchase and target met.', icon: icons.star },
  { title: 'Redeem', text: 'Redeem your points from the Wallet section of the app.', icon: icons.gift },
];

function DownloadButton({ className = '', pulse = false }: { className?: string; pulse?: boolean }) {
  return (
    <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer" className={`btn-primary ${pulse ? 'btn-pulse' : ''} ${className}`}>
      Download on Play Store
      <ArrowRight />
    </a>
  );
}


/** Safonix Smart Link app promotion for the home page: the five steps in one compact box with the phone. */
export function SmartLinkSection() {
  return (
    <div id="smart-link" className="sl scroll-mt-20">
      <section id="how-it-works" className="relative scroll-mt-24 py-6 lg:py-8">
        <div className="container-page mb-3 text-center">
          <p className="sl-kicker c !mb-2">How it works</p>
          <h3 className="sl-h2 !text-[clamp(1.6rem,3vw,2.4rem)]">Get started in <span className="text-brand-500">5 easy steps</span></h3>
        </div>
        <div className="container-page">
          <StepsStage downloadUrl={PLAY_STORE_URL} perks={highlights.map((item) => ({ title: item.title, text: item.text, icon: <Icon className="size-[22px]">{item.icon}</Icon> }))} steps={steps.map((step) => ({ ...step, icon: <Icon className="size-[22px]">{step.icon}</Icon> }))} />
        </div>
      </section>
    </div>
  );
}
