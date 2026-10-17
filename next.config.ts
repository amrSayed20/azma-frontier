import type { NextConfig } from "next";

// Applied to all routes except Next.js static chunks (those use immutable
// content-hash URLs and are safe to cache forever).
const NO_CACHE_HEADERS = [
  // Browser: never store this response.
  { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
  { key: 'Pragma', value: 'no-cache' },
  { key: 'Expires', value: '0' },
  // Cloudflare edge: CDN-Cache-Control takes precedence over Cache-Control
  // at the edge layer — it overrides Page Rules, Cache Level, and Browser
  // Cache TTL settings so the edge never stores these pages regardless of
  // what the Cloudflare dashboard is configured to do.
  { key: 'CDN-Cache-Control', value: 'no-store' },
  { key: 'Cloudflare-CDN-Cache-Control', value: 'no-store' },
];

// Applied to every response, uploads included. nosniff stops a browser from
// running an uploaded text file as a page; the frame rule stops other sites
// from framing AZMA pages to trick a click. HSTS and a Content Security
// Policy are left to the edge, where the production domain is known.
const SECURITY_HEADERS = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
];

const nextConfig: NextConfig = {
  experimental: {
    workerThreads: false,
  },
  outputFileTracingExcludes: {
    '*': ['./public/renders/**'],
  },
  async headers() {
    return [
      {
        // All routes except Next.js static assets (those have content-hash
        // names — a new build produces new URLs, so old entries are never
        // re-fetched).
        source: '/((?!_next/static|_next/image|favicon\\.ico).*)',
        headers: NO_CACHE_HEADERS,
      },
      { source: '/:path*', headers: SECURITY_HEADERS },
    ];
  },
  async redirects() {
    return [
      // Cloudflare Mobile Redirect sends mobile visitors to /m which has no
      // route in this app. Redirect immediately to the Foyer so they land
      // somewhere real instead of a 404.
      { source: '/m', destination: '/imperial-foyer', permanent: false },
      // Earlier builds sent signed-out visitors to /creator-access, which
      // has no route; old links and bookmarks land on sign-in instead.
      { source: '/creator-access', destination: '/login', permanent: false },
    ];
  },
};

export default nextConfig;
