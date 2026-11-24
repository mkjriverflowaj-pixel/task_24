# CMS (Strapi 5). Build from this folder:  docker compose build cms
# Strapi is installed on its own (its admin needs React 18, the website uses React 19), from apps/cms/package-lock.json.

FROM node:22.23.4-bookworm-slim AS build
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Builds the admin panel and compiles the TypeScript.
RUN npm run build

FROM node:22.23.4-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=1337
COPY --from=build --chown=node:node /app ./
# Uploaded pictures live outside the image (mounted at /app/public/uploads).
RUN mkdir -p public/uploads && chown -R node:node public .tmp 2>/dev/null; true
USER node
EXPOSE 1337
CMD ["npm", "run", "start"]
