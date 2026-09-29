import path from 'path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Next.js options go here
  // See: https://nextjs.org/docs/app/api-reference/config/next-config-js
  turbopack: {
    root: path.resolve(__dirname, '../..')
  }
};

export default nextConfig;
