'use client';

import { useEffect } from 'react';

/**
 * Registers the hand-written service worker (public/sw.js) — no
 * next-pwa/Workbox dependency, matching this platform's own established
 * taste for small, understood, single-file provider wrappers (the
 * Launch Provider, the Payment Provider) over adding a framework.
 * Renders nothing; mounted once at the root layout.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent: a failed registration must never block the platform itself.
    });
  }, []);

  return null;
}
