# Safonix Smart Link page (removed from the website)

The standalone page `/safonix-smart-link` and its "Safonix Smart Link" navigation link were removed from the website.
The same content still lives on the **home page** as the `#smart-link` section (between Spaces and New Arrivals), which was left alone.
This note records what the page was, so it can be brought back later.

## What the page contained

1. **Intro**: kicker "The Safonix rewards app", heading "Safonix **Smart Link**", short lede ("Scan the QR code on Safonix packaging, earn points and bonuses, and redeem them from your in-app wallet"), and a "Download on Play Store" button.
2. **Scroll-zoom into the QR code** (`ZoomCode`): scrolling zoomed into a code, ending on three pillars. It was switched by the CMS (Strapi single type for animation, component "Smart Link page motion": `qrEffect` on/off and `qrSeconds`).
3. **How it works, "Get started in 5 easy steps"** (`StepsShowcase`): a sticky phone mock-up changed screen as the page scrolled through five steps.
4. Closing **Download on Play Store** call to action.

## Copy

Pillars: **Scan** (scan QR codes on Safonix packaging), **Earn** (points and bonuses with every scan, purchase and target met), **Redeem** (redeem points from the Wallet section of the app).

Steps:
1. **Install from the Play Store**: search "Safonix Smart Link" on Google Play and tap Install.
2. **Register as a Dealer, Distributor or Electrician**: needs email, phone number and the unique code from the distributor or dealer.
3. **Explore products and offers**: latest product and offer information.
4. **Scan the code**: scan the QR on product packaging with the in-app scanner; each valid scan is recorded against the account.
5. **Earn points and bonuses**: scans, purchases and sales targets add points and bonuses to the wallet, redeemable for benefits.

Play Store link: `https://play.google.com/store/apps/details?id=com.safonix.app&hl=en_IN`

## Where the code is

All still in `apps/web/src/components/smartlink/`:

| File | Purpose |
|---|---|
| `SmartLinkSection.tsx` | Copy (steps, pillars, icons) and the home-page section wrapper (`id="smart-link"`) |
| `StepsStage.tsx` | Compact auto-advancing steps stage used on the home page |
| `StepsShowcase.tsx` | The scroll-driven steps with the sticky phone (the page version, currently unused) |
| `ZoomCode.tsx` | The scroll-zoom QR effect (currently unused) |
| `smart-link.css` | Styles, all prefixed `sl-` and scoped under `.sl` |
| `qr.tsx`, `anim.ts` | QR drawing and animation helpers |

CMS: `apps/cms/src/components/animation/smartlink-motion.json` still exists, and the web app's motion loader (`getMotion().smartLink`) still returns its values.

## How to bring the page back

1. Create `apps/web/src/app/safonix-smart-link/page.tsx` that renders the intro, then `ZoomCode` (pass `enabled` and `seconds` from `getMotion().smartLink`), then `StepsShowcase`, then the download button. Reuse `steps`, `highlights` and `Icon` from `SmartLinkSection.tsx` (export them).
2. Add the nav link `{ href: '/safonix-smart-link', label: 'Safonix Smart Link' }` in `apps/web/src/components/Header.tsx` (the desktop `<nav>` and the mobile list).
3. Optionally point the footer quick link (`Footer.tsx`, and the seed in `apps/cms/src/home-design.ts`) at the page instead of `/#smart-link`.

## Left in place on purpose

- The home-page `#smart-link` section.
- The footer "Safonix Smart Link" quick link, which scrolls to that home section.
- Mentions of "Safonix Smart Link" in text (hover card in `Rich.tsx`, login and register pages, account overview).
