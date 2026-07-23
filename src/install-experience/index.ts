/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * Public API — import from here, never directly from the individual
 * files.
 *
 * DISCLOSED PLATFORM CONSTRAINT: `beforeinstallprompt` is Chromium-only.
 * iOS Safari has no programmatic install prompt at all — see
 * detect-platform.ts and InstallInvitation.tsx for how each is handled
 * honestly rather than papered over.
 */

export type { InstallPlatform, BeforeInstallPromptEvent } from './types';
export { InstallInvitationProvider, useInstallInvitation } from './InstallInvitationProvider';
export { InstallInvitation } from './InstallInvitation';
export { ServiceWorkerRegistrar } from './ServiceWorkerRegistrar';
export { hasBeenInstalledByThisFlow } from './dismissal-service';
