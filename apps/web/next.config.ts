import type { NextConfig } from 'next';

const strapi = new URL(process.env.STRAPI_URL ?? 'http://localhost:1337');
const medusa = new URL(process.env.MEDUSA_URL ?? 'http://localhost:9000');

const remote = (url: URL, pathname: string) => ({
  protocol: url.protocol.replace(':', '') as 'http' | 'https',
  hostname: url.hostname,
  port: url.port,
  pathname,
});

const nextConfig: NextConfig = {
  images: {
    // Page pictures come from Strapi uploads; product pictures from Medusa's file storage.
    remotePatterns: [remote(strapi, '/uploads/**'), remote(medusa, '/static/**')],
    dangerouslyAllowLocalIP: true,
  },
};

export default nextConfig;
