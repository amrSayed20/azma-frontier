/**
 * AZMA OS — THE CONSTITUTIONAL IDENTITY
 * The Imperial Presence Registry
 * Construction Phase VI
 *
 * Records the real, actual page routes this application serves —
 * confirmed against `next build`'s own route manifest immediately before
 * this file was written, not guessed or estimated. API routes are
 * deliberately excluded: DirectorStage (the Presence mechanism this
 * phase certifies) is a UI component and never renders for a route that
 * has no page. Used by certification.ts to prove every route a Creator
 * can actually visit resolves to a complete constitutional identity.
 */

export const KNOWN_APPLICATION_ROUTES: readonly string[] = [
  '/',
  '/_not-found',
  '/hujjah-al-damighah',
  '/makman-al-ghayah',
  '/qiyamah-chamber',
  '/ras-amr',
  '/sovereign-explorer',
  '/sovereign-gate',
  '/sovereign-high-council',
  '/sovereign-member',
  '/sovereign-vault',
  '/sovereign-vault-palace',
] as const;
