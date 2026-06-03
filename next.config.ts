import type { NextConfig } from 'next';

const replitDomain = process.env.REPLIT_DEV_DOMAIN;

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  allowedDevOrigins: replitDomain
    ? [`https://${replitDomain}`, `http://${replitDomain}`]
    : [],
};

export default nextConfig;
