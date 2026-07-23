/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * Dismissal Service
 *
 * "If the Creator dismisses the invitation, it should respect that
 * decision and avoid becoming intrusive" — a permanent, per-device
 * dismissal, not a cooldown-and-retry. Once declined, the proactive
 * invitation never asks again on that device; a quiet, permanent
 * affordance elsewhere remains available for a Creator who changes
 * their mind (see InstallInvitation.tsx).
 */

const DISMISSED_KEY = 'azma.install.dismissed';
const INSTALLED_KEY = 'azma.install.installed';

export function hasBeenDismissed(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(DISMISSED_KEY) === 'true';
}

export function markDismissed(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DISMISSED_KEY, 'true');
}

export function hasBeenInstalledByThisFlow(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(INSTALLED_KEY) === 'true';
}

export function markInstalled(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(INSTALLED_KEY, 'true');
}
