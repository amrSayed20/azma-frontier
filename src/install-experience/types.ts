/**
 * AZMA OS — THE IMPERIAL INSTALL EXPERIENCE
 * Type Definitions
 */

/** The subset of the real `BeforeInstallPromptEvent` this module actually uses — not in the standard DOM lib types. */
export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export type InstallPlatform =
  | 'chromium'          // has captured beforeinstallprompt — can trigger real browser install
  | 'chromium-manual'   // Chromium browser but no prompt (HTTP or already seen) — show browser-menu guide
  | 'ios-safari'        // iOS Safari — show Share → Add to Home Screen guide
  | 'unsupported'       // non-Chromium, non-iOS (e.g. desktop Firefox) — no install path
  | 'already-installed';
