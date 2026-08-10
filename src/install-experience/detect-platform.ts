/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * Platform Detection
 *
 * DISCLOSED PLATFORM CONSTRAINT: `beforeinstallprompt` exists only on
 * Chromium browsers (Chrome, Edge, Samsung Internet). Safari on iOS has
 * no programmatic install prompt at all — the only real path there is a
 * manual Share -> Add to Home Screen gesture this code cannot trigger.
 * This function tells the invitation which of those two real
 * capabilities it has, rather than pretending they're the same thing.
 */

import type { InstallPlatform } from './types';

function isStandaloneDisplayMode(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
}

function isIosSafari(): boolean {
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIos && isSafari;
}

function isChromiumBrowser(): boolean {
  const ua = window.navigator.userAgent;
  return /Chrome\//.test(ua) || /Edg\//.test(ua);
}

export function detectInstallPlatform(hasCapturedPrompt: boolean): InstallPlatform {
  if (typeof window === 'undefined') return 'unsupported';
  if (isStandaloneDisplayMode()) return 'already-installed';
  if (hasCapturedPrompt) return 'chromium';
  if (isIosSafari()) return 'ios-safari';
  // Chromium on HTTP (or after the prompt was already used) — can still guide
  // the Creator to install via the browser's own menu.
  if (isChromiumBrowser()) return 'chromium-manual';
  return 'unsupported';
}
