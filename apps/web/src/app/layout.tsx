import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Syne } from 'next/font/google';
import { BackToTop } from '@/components/BackToTop';
import { Footer } from '@/components/Footer';
import { FxLayer } from '@/components/FxLayer';
import { Header } from '@/components/Header';
import { PowerOn } from '@/components/PowerOn';
import { CartDrawer } from '@/components/store/CartDrawer';
import { StoreProvider } from '@/components/store/StoreProvider';
import { getMotion } from '@/lib/motion';
import './globals.css';

const syne = Syne({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-syne', display: 'swap' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'Safonix India | Premium Electrical Products & Solutions',
    template: '%s | Safonix India',
  },
  description:
    'Safonix India manufactures quality modular switches, LED lighting, wires and cables, MCBs and distribution boards, and ventilation fans.',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Animation Settings from Strapi: the intro and click sparks can be switched off there.
  const motion = await getMotion();
  return (
    <html lang="en" className={`${jakarta.variable} ${syne.variable}`} data-scroll-behavior="smooth" data-intro={motion.home.preloader ? 'play' : 'done'} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('safonix-theme');if(t==='dark')document.documentElement.dataset.theme='dark'}catch(e){}" }} />
      </head>
      <body className="flex min-h-screen flex-col">
        {motion.home.preloader && <PowerOn />}
        {motion.home.clickSparks && <FxLayer />}
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BackToTop />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
