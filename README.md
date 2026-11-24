# Safonix

Website for Safonix India. It is a monorepo with two apps:

| App | Folder | What it is |
|---|---|---|
| Web | `apps/web` | Public website (Next.js 16, React 19, Tailwind 4, TypeScript) |
| CMS | `apps/cms` | Content management (Strapi 5, PostgreSQL) |

The website holds no content of its own. Every page (home, about, products, FAQs, legal pages, contact details, offices) is fetched from Strapi over HTTP. Content edited in Strapi appears on the site within about 60 seconds (`revalidate: 60` in `apps/web/src/lib/strapi.ts`).

## Requirements

- Node.js 22 or newer (Strapi supports up to 26.x)
- npm
- PostgreSQL (the CMS is configured for it; the default database name is `safonix`)

## Setup

### 1. CMS

```bash
cd apps/cms
npm install
cp .env.example .env     # then fill in the values (see below)
npm run dev              # http://localhost:1337 (admin: /admin)
```

Fill in `apps/cms/.env`:

- `HOST`, `PORT` (default 0.0.0.0 / 1337)
- `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`, `ENCRYPTION_KEY`: generate your own random secrets. Never reuse another environment's secrets.
- `DATABASE_CLIENT=postgres`, `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`, `DATABASE_SSL`

On first start, open `/admin` and create an admin user.

### 2. Content

The content lives in the PostgreSQL database and the uploaded images in `apps/cms/public/uploads`. Neither is in the code, so restore them from the handover files:

```bash
cd apps/cms
npx strapi import -f path/to/safonix-export-<date>.tar.gz
```

This restores content and media into an empty Strapi. To create a fresh export from a running setup:

```bash
npx strapi export
```

`apps/cms/data/seed.json` only holds older starter content and is not used by the website.

### 3. Web

```bash
cd apps/web
npm install
```

Create `apps/web/.env.local`:

```
STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Then:

```bash
npm run dev      # http://localhost:3000
```

Strapi must be running before the website, otherwise pages that are not already cached will fail to load.

## Production

```bash
# CMS
cd apps/cms
npm run build
npm run start

# Web
cd apps/web
npm run build
npm run start    # port 3000
```

Set `STRAPI_URL` and `NEXT_PUBLIC_SITE_URL` to your real URLs. Strapi must be reachable at build time too, because some pages are generated during `next build`. For the CMS, set `NODE_ENV=production` and use production secrets and database.

## Project structure

```
apps/
  web/
    src/app/          Pages (home, about-us, products, product, faqs, contact-us, safonix-smart-link, [slug] for legal pages)
    src/components/   Shared components (header, footer, carousels, reveal animations, etc.)
    src/lib/strapi.ts All CMS requests and content types
    public/           Static images
  cms/
    src/              Content types and Strapi code
    config/           Database, server and plugin config
    public/uploads/   Uploaded media (not in the database)
```

## Things set directly in the code

These are not managed in Strapi, so change them in the code:

- Play Store link for the app: `https://play.google.com/store/apps/details?id=com.safonix.app&hl=en_IN`
- "Website Design By Nextdynamix" link (`https://nextdynamix.com/`) and the copyright link to `https://safonixindia.com/`, in the footer (`apps/web/src/components/Footer.tsx`)
- The hover cards and auto-links for emails, URLs, "Safonix Smart Link", "Safonix app" and "Nextdynamix" inside the legal pages (`apps/web/src/components/Rich.tsx`)
- All text on the Safonix Smart Link page (`apps/web/src/app/safonix-smart-link/page.tsx`)

## Notes

- Privacy Policy, Terms and Conditions and Cookies Policy text is edited in Strapi under Legal Pages. Simple markup is supported: `### ` for headings, `- ` for bullets, `**bold**`.
- Do not commit `.env` or `.env.local` files, `node_modules`, `.next`, `dist` or `.tmp`.
