/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * DIAGNOSTIC BUILD — all fetch events pass through the browser natively.
 * No caching, no interception. Purpose: isolate whether the Service Worker
 * is the root cause of "This page couldn't load" on /imperial-foyer navigation.
 */

const CACHE_NAME = 'azma-os-shell-v3';

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
