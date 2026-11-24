# Website (Next.js). Build from the repo root:  docker compose build web
# The packages are installed from the repo's lockfile, so the image gets exactly the versions the project is tested with.

FROM node:22.23.4-bookworm-slim AS deps
WORKDIR /repo
COPY package.json package-lock.json .npmrc ./
COPY apps/web/package.json apps/web/
# The lockfile covers every workspace, so the backend's manifest has to be present; only the website's packages are installed.
COPY apps/backend/package.json apps/backend/
RUN npm ci --workspace=@safonix/web

FROM node:22.23.4-bookworm-slim AS build
WORKDIR /repo
ENV NEXT_TELEMETRY_DISABLED=1
# These are baked into the build. The pages are generated while building, so Strapi and Medusa must be reachable at
# STRAPI_URL and MEDUSA_URL for `docker compose build`. The publishable key is a public key, not a secret.
ARG STRAPI_URL
ARG STRAPI_PUBLIC_URL
ARG MEDUSA_URL
ARG MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_IMAGE_UNOPTIMIZED
ENV STRAPI_URL=$STRAPI_URL STRAPI_PUBLIC_URL=$STRAPI_PUBLIC_URL MEDUSA_URL=$MEDUSA_URL \
    MEDUSA_PUBLISHABLE_KEY=$MEDUSA_PUBLISHABLE_KEY NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_IMAGE_UNOPTIMIZED=$NEXT_IMAGE_UNOPTIMIZED
COPY --from=deps /repo/node_modules ./node_modules
COPY package.json package-lock.json .npmrc ./
COPY apps/web ./apps/web
RUN npm run build --workspace=@safonix/web

FROM node:22.23.4-bookworm-slim AS run
WORKDIR /repo
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public
USER node
EXPOSE 3000
CMD ["node", "apps/web/server.js"]
