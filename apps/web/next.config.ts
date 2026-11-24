import path from 'node:path';
import type { NextConfig } from 'next';

// Strapi's address as the visitor's browser sees it (media links). It is STRAPI_URL unless the server reaches Strapi
// by another name, as it does in Docker.
const strapi = new URL(process.env.STRAPI_PUBLIC_URL ?? process.env.STRAPI_URL ?? 'http://localhost:1337');
const medusa = new URL(process.env.MEDUSA_URL ?? 'http://localhost:9000');

const remote = (url: URL, pathname: string) => ({
  protocol: url.protocol.replace(':', '') as 'http' | 'https',
  hostname: url.hostname,
  port: url.port,
  pathname,
});

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image (apps/web/Dockerfile); the tracing root is the repo root because the
  // packages are installed there.
  output: 'standalone',
  outputFileTracingRoot: path.join(__dirname, '../..'),
  images: {
    // Docker only: the container cannot reach the pictures at the visitor-facing address, so the browser loads them
    // straight from Strapi and Medusa instead of through Next's image optimiser.
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === 'true',
    // Page pictures come from Strapi uploads; product pictures from Medusa's file storage.
    remotePatterns: [remote(strapi, '/uploads/**'), remote(medusa, '/static/**')],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
