import type { NextConfig } from "next";

// Applied to all routes except Next.js static chunks (those use immutable
// content-hash URLs and are safe to cache forever).
// ── WHAT A BROWSER IS TOLD BEFORE THE FIRST BYTE OF THE PAGE ───────────────
//
//   MEASURED ON THE LIVE SITE 2026-11-13, before this block existed: the edge
//   already sent `Strict-Transport-Security` and `X-Content-Type-Options`.
//   It sent NOTHING about framing — so any site on the internet could put
//   azmaos.com in an iframe and lay invisible controls over the Creator's own
//   buttons. The buttons underneath include the one that spends their
//   balance, and the whole balance and payment surface. That is clickjacking,
//   and on a platform that holds money it is a commercial risk, not a
//   hardening nicety.
//
//   Declared HERE and not only at the edge on purpose: a header the
//   repository states travels with every deployment and can be read in a
//   diff. A header that lives only in a dashboard is true until someone
//   changes a dashboard.
const SECURITY_HEADERS = [
  // No one frames this Empire. `frame-ancestors` is the modern rule and
  // `X-Frame-Options` is the one older browsers obey — both, because a
  // Creator's browser is not ours to choose.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
  // A Creator's page URL carries their work's identifiers. It does not
  // travel to another origin.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // The chamber records voice when a Creator asks it to, so the microphone is
  // allowed to THIS origin and nowhere else. Camera and location are asked
  // for nowhere in this platform, so they are refused outright.
  { key: 'Permissions-Policy', value: 'camera=(), geolocation=(), microphone=(self), payment=()' },
  // The edge sends this today. Declared here too, so a change at the edge
  // cannot silently remove it.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
];

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
  // ── MTProto IN A CREATOR'S BROWSER ────────────────────────────────────────
  //
  // GramJS ships one build for both runtimes and picks its transport at RUN
  // time — telegramBaseClient.js reads
  //
  //     networkSocket: isNode ? PromisedNetSockets : PromisedWebSockets
  //
  // so in a browser it speaks MTProto over WebSocket, as Telegram's own web
  // clients do. The IMPORT of `net` is static all the same, and a browser has
  // no `net`, `fs` or `os`. Without these three lines the Chamber does not
  // build at all:
  //
  //     ./node_modules/telegram/extensions/net.js:17
  //     Module not found: Can't resolve 'net'
  //
  // The `browser` condition is the whole point: every one of these resolves
  // normally on the server, where real code genuinely uses them. Only the
  // client bundle gets the empty object, and only because nothing there ever
  // dereferences it.
  turbopack: {
    resolveAlias: {
      net: { browser: './src/node-shims/absent-in-browser.js' },
      fs: { browser: './src/node-shims/absent-in-browser.js' },
      os: { browser: './src/node-shims/absent-in-browser.js' },
    },
  },

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
  // WHAT `unoptimized` ACTUALLY DOES — measured, after this was first written
  // claiming more than was true:
  //
  //   It makes every <Image> pass its source through untouched. It does NOT
  //   take the /_next/image endpoint out of service. Measured on the server,
  //   bypassing nginx: http://127.0.0.1:3000/_next/image?url=/favicon.ico → 200.
  //
  // So the route is closed by nginx (`return 404`), and that is the first
  // layer. The second layer is real but is not this setting — it is that
  // /uploads/ now requires a session, and the optimizer's own internal fetch
  // carries none. Measured, again on the node directly:
  //
  //   before:  400 "The requested resource isn't a valid image"
  //            → it HAD fetched the file and handed it to the decoder
  //   after:   400 "url parameter is valid but internal response is invalid"
  //            → it never obtained the file at all
  //
  // That change of wording is the evidence that the chain is broken at the
  // source and not merely at the edge: even with nginx removed entirely, no
  // uploaded byte reaches an image decoder.
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
      {
        // Security headers go on EVERYTHING, static assets included: a script
        // or a font is as framable as a page.
        source: '/:path*',
        headers: SECURITY_HEADERS,
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
