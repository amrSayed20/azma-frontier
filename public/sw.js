/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * TRANSPARENT BUILD v4 — all fetch events pass through the browser natively.
 * No caching, no interception. All caches cleared on activation.
 * Served with Cache-Control: no-store so browsers always fetch the latest version.
 */

const CACHE_NAME = 'azma-os-shell-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((name) => caches.delete(name))),
    ),
  );
  self.clients.claim();
});

// No fetch handler — every request goes directly to the network.
// The SW is active (controlling clients) but completely transparent.
