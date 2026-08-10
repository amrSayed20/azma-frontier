'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { BeforeInstallPromptEvent, InstallPlatform } from './types';
import { detectInstallPlatform } from './detect-platform';
import { hasBeenDismissed, markDismissed, markInstalled } from './dismissal-service';

interface InstallInvitationContextValue {
  readonly visible: boolean;
  readonly platform: InstallPlatform;
  /** Proactive — called once, by the Chamber, at the moment of earned trust. Respects a prior dismissal permanently. */
  readonly triggerInvitation: () => void;
  /** The quiet, permanent affordance for a Creator who changes their mind later — always allowed, ignores dismissal. */
  readonly openManually: () => void;
  readonly accept: () => Promise<void>;
  readonly dismiss: () => void;
}

const InstallInvitationContext = createContext<InstallInvitationContextValue | null>(null);

/**
 * Mounted once, at the root layout, as a sibling of every other
 * platform-wide presence (DirectorStage, the Sovereign Body awakenings).
 * Captures the browser's own beforeinstallprompt silently on mount —
 * suppressing its default mini-infobar — so the Empire's own authored
 * invitation can be shown later, at the moment this platform actually
 * chooses, not whenever the browser's own heuristics decide.
 */
export function InstallInvitationProvider({ children }: { readonly children: React.ReactNode }) {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [hasCapturedPrompt, setHasCapturedPrompt] = useState(false);
  const [visible, setVisible] = useState(false);
  // Derived directly from hasCapturedPrompt — detectInstallPlatform is a pure read of window/navigator, safe to call during render (SSR-guarded internally).
  const platform: InstallPlatform = detectInstallPlatform(hasCapturedPrompt);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setHasCapturedPrompt(true);
    };
    const onAppInstalled = () => {
      markInstalled();
      setVisible(false);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const triggerInvitation = useCallback(() => {
    if (hasBeenDismissed()) return;
    if (platform === 'already-installed' || platform === 'unsupported') return;
    setVisible(true);
  }, [platform]);

  const openManually = useCallback(() => {
    if (platform === 'already-installed' || platform === 'unsupported') return;
    setVisible(true);
  }, [platform]);


  const accept = useCallback(async () => {
    const deferred = deferredPromptRef.current;
    if (!deferred) {
      setVisible(false);
      return;
    }
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === 'accepted') markInstalled();
    deferredPromptRef.current = null;
    setVisible(false);
  }, []);

  const dismiss = useCallback(() => {
    markDismissed();
    setVisible(false);
  }, []);

  return (
    <InstallInvitationContext.Provider value={{ visible, platform, triggerInvitation, openManually, accept, dismiss }}>
      {children}
    </InstallInvitationContext.Provider>
  );
}

export function useInstallInvitation(): InstallInvitationContextValue {
  const context = useContext(InstallInvitationContext);
  if (!context) {
    throw new Error('useInstallInvitation must be used within an InstallInvitationProvider (mounted at the root layout).');
  }
  return context;
}
