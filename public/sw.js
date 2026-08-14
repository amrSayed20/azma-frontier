/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * Hand-written service worker — no next-pwa/Workbox dependency, matching
 * this platform's own established preference for small, understood,
 * single-file provider wrappers over adding a framework.
 *
 * Strategy: network-first for navigations (a Creator should never be
 * served a stale page when the network is available), cache-first for
 * the platform's own static assets. Never intercepts API routes —
 * generation, billing, and auth must always reach the real network.
 */

const CACHE_NAME = 'azma-os-shell-v2';
const APP_SHELL = ['/manifest.webmanifest', '/icons/icon-192', '/icons/icon-512'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).catch(() => {
      // A failed pre-cache must never block installation.
    }),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept API routes — auth, billing, and generation must reach the real network.
  if (url.pathname.startsWith('/api/')) return;
  if (request.method !== 'GET') return;

  // Never intercept Next.js internal navigation requests (RSC payloads, prefetch, router state).
  // These carry session-bound state and must always reach the server — intercepting them
  // causes "This page couldn't load" when they get redirects the SW follows silently.
  if (
    request.headers.get('RSC') ||
    request.headers.get('Next-Router-State-Tree') ||
    request.headers.get('Next-Router-Prefetch') ||
    request.headers.get('Next-Fetch-Token') ||
    url.pathname.startsWith('/_next/data/')
  ) return;

  // Static assets (_next/static/): cache-first with network fallback.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      }),
    );
    return;
  }

  // App shell assets (icons, manifest): cache-first with network fallback.
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).catch(() => new Response('', { status: 503 }));
      }),
    );
    return;
  }

  // Page navigations: network-first. Let the browser follow any server redirects
  // directly (including auth redirects) — do not intercept the redirect chain.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/').then((cached) => cached || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } }))
      ),
    );
  }
});
