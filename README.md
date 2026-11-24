# Safonix

Website for Safonix India. It is a monorepo (npm workspaces + Turborepo) with three apps:

| App | Folder | What it is |
|---|---|---|
| Web | `apps/web` | Public website (Next.js 16, React 19, Tailwind 4, TypeScript) |
| CMS | `apps/cms` | Page content (Strapi 5, PostgreSQL) |
| Backend | `apps/backend` | Commerce (Medusa v2): products, cart, orders, shopper accounts, admin |

The website gets its page content (home, about, FAQs, legal pages, contact details, offices) from Strapi over HTTP, and its products, cart, orders and accounts from Medusa. Content edited in Strapi appears on the site within about 60 seconds (`revalidate: 60` in `apps/web/src/lib/strapi.ts`).

## Monorepo

- `apps/web` and `apps/backend` are npm workspaces and share one install at the repo root. `apps/cms` (Strapi) has its own install, because its admin needs React 18 while the website and Medusa use React 19.
- Install everything: `npm run install:all`. Run: `npm run dev` (website and Medusa through Turborepo) and `npm run cms:dev` (Strapi). Per app: `web:dev`, `backend:dev`, `cms:dev`.
- Node 22.23.4 (`.nvmrc`). `.npmrc` keeps `save-exact` (new packages are saved with an exact version; add `--no-save-exact` for a normal `^` range) and `engine-strict`.
- Exact versions are used for the packages that must match each other (Next.js, React, Strapi, `@medusajs/*`); everything else uses `^` ranges, and the lockfiles fix what is installed.

## Docker

`docker-compose.yml` (repo root) runs the database, the CMS and the website. Medusa still runs on this computer (`npm run backend:dev`); the containers reach it through `host.docker.internal`.

```bash
cp .env.example .env     # then set MEDUSA_PUBLISHABLE_KEY and POSTGRES_PASSWORD (same password as apps/cms/.env)
docker compose up -d --build postgres cms     # database + Strapi, http://localhost:1337/admin
docker compose up -d --build web              # website, http://localhost:3000
docker compose down                           # stop (data stays)
```

- **Database:** one PostgreSQL server (`safonix-postgres`, port 5433 on this computer) holds `safonix` (Strapi) and `safonix_commerce` (Medusa). Its data is in the Docker volume `safonix_pgdata`, which survives rebuilds. Never run `docker compose down -v`: it deletes the volume.
- **CMS content:** the database plus the pictures in `apps/cms/public/uploads`, which is mounted into the container.
- **CMS settings:** the container reads secrets from `apps/cms/.env` and only overrides the database host and port.
- **Website build:** the pages are generated while the image is built, so Strapi and Medusa must be running when you run `docker compose build web`. Rebuild the website image after changing the website code.
- In Docker the website serves pictures straight from Strapi and Medusa (`NEXT_IMAGE_UNOPTIMIZED=true`), because the container cannot reach their browser-facing addresses.

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

The website's packages are installed from the repo root (`npm install`, or `npm run install:all`).

Create `apps/web/.env.local` (see `apps/web/.env.example`):

```
STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_SITE_URL=http://localhost:3000
MEDUSA_URL=http://localhost:9000
MEDUSA_PUBLISHABLE_KEY=pk_...        # printed by `npm run seed` in apps/backend
```

Then, from the repo root:

```bash
npm run web:dev      # http://localhost:3000
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
