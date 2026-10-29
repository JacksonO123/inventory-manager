import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js
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
