import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
  },
  async redirects() {
    return [
      // Cloudflare Mobile Redirect sends mobile visitors to /m which has no
      // route in this app. Redirect immediately to the Foyer so they land
      // somewhere real instead of a 404.
      { source: '/m', destination: '/imperial-foyer', permanent: false },
    ];
  },
};

export default nextConfig;
