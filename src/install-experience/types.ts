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

export type InstallPlatform = 'chromium' | 'ios-safari' | 'unsupported' | 'already-installed';
