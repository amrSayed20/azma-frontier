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

const CACHE_NAME = 'azma-os-shell-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/icons/icon-192', '/icons/icon-512'];

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

  // Never intercept API routes — real generation, billing, and auth calls always go straight to the network.
  if (url.pathname.startsWith('/api/')) return;
  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match('/'))),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
