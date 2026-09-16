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

const nextConfig: NextConfig = {
  // Version-skew protection. Every build gives Server Actions new ids, so a tab
  // left open across a deployment fires an action the new build has never heard
  // of and Next.js replaces the whole app with its error screen — the black
  // page reported after repeated sign-in/sign-out. With a deployment id, Next
  // recognises the mismatch and reloads the client instead of breaking it.
  // scripts/deploy.sh sets NEXT_DEPLOYMENT_ID per release; the timestamp
  // fallback keeps local builds distinct from one another.
  deploymentId: process.env.NEXT_DEPLOYMENT_ID || `local-${Date.now()}`,

  // ── SECURITY CLOSURE — the image optimizer is shut off ────────────────────
  //
  // MEASURED, ON PRODUCTION, BEFORE THIS LINE EXISTED:
  //
  //   GET /_next/image?url=/favicon.ico&w=64&q=75   → 200, 25,931 bytes
  //   GET /_next/image?url=/uploads/<file>&w=64&q=75 → 400 "isn't a valid image"
  //
  // The second response is the dangerous one: it is a refusal about the file's
  // CONTENT, which means the optimizer had already fetched the uploaded file
  // and handed it to the decoder. Any unauthenticated visitor could aim that
  // decoder at bytes an attacker had planted, and the decoder was sharp 0.34.5
  // over libheif — GHSA-rgj7-g3m4-5g8c — behind Next 16.2.6's own
  // GHSA-2xp9-vwfh-vxw4, unauthenticated RCE on AVIF input.
  //
  // WHY SHUTTING IT OFF COSTS NOTHING:
  //
  //   Not one file in this repository imports `next/image`, and not one imports
  //   `sharp`. Measured: zero matches in app/ and src/. The route was a public
  //   attack surface serving a capability the Empire does not use.
  //
  // `unoptimized` makes every <Image> pass its source through untouched and
  // takes /_next/image out of service. Nginx refuses the path as well, so the
  // route is closed at two layers rather than one — see the server block.
  images: {
    unoptimized: true,
    // Belt and braces: even if the optimizer were re-enabled by a future edit,
    // no remote host is permitted and the formats that reach libheif are not
    // offered. An empty remotePatterns list is the default, stated here so the
    // absence is deliberate and visible rather than inherited.
    remotePatterns: [],
    formats: ['image/webp'],
  },

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
    ];
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
