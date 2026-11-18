import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js
  transpilePackages: [
    'better-auth',
    '@better-auth/core',
    '@better-auth/telemetry',
    '@better-auth/drizzle-adapter',
    '@better-auth/kysely-adapter',
    'kysely',
    'jose',
    '@noble/ciphers',
    '@noble/hashes'
  ],
  turbopack: {
    root: path.resolve(__dirname, '../..')
  },
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        hostname: 'lh3.googleusercontent.com'
      }
    ]
  }
};

export default nextConfig;
