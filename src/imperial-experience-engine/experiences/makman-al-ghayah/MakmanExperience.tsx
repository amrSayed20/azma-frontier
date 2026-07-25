'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { useVisitorPresence } from '@/src/visitor-presence';
import { setAtmosphere } from '@/src/design-system';
import { useExperienceLifecycle } from '../../engine';
import './makman-experience.css';

const REVEAL_DURATION_MS = 500;

/** Arabic-only, hardcoded — matching this page's own existing reality:
    every other string on app/makman-al-ghayah/page.tsx is a hardcoded
    Arabic literal, no dict/locale system is wired in there at all. The
    message deliberately echoes the Chamber's own name: "Ghayah" means
    purpose/destination — the Creator has reached their Ghayah. */
const COMPANION_MESSAGE = 'بلغتَ غايتك';

interface Props {
  readonly children: ReactNode;
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Makman Al Ghayah Experience
 *
 * IMPERIAL CHAMBER UNIFICATION, PHASE II PACKAGE III (2026-07-25): the
 * sixth registered Experience Pipeline, and the third Chamber (after
 * Qiyamah, Ras Al Amr) — built the same additive way. The live page
 * (app/makman-al-ghayah/page.tsx, "The Sovereign Release Terminal") had
 * zero IXE/Presence/Atmosphere/Voice integration; this wrapper adds
 * exactly that, and nothing else — the page's own local-state
 * distribution console, its CSS, and its one real but disconnected
 * backend capability (SOEL's submit-for-distribution /
 * request-access-to-published-work) are untouched.
 *
 * Atmosphere: 'victorious' — "Completion. The empire acknowledges what
 * the citizen has accomplished... This is done. It is permanent." Not
 * previously used by any chamber (Arrival/Signup/Login use 'calm',
 * Qiyamah 'creating', Ras Al Amr 'deliberating'), and the only one of
 * the Design System's seven atmospheres that actually means
 * "fulfillment" rather than being stretched to fit — chosen because
 * this Package's own directive names Makman "the Chamber where purpose
 * is fulfilled," not because it was the only one left.
 */
export function MakmanExperience({ children }: Props) {
  const { phase } = useExperienceLifecycle({
    revealDurationMs: REVEAL_DURATION_MS,
    handoffDurationMs: 0,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const presence = useVisitorPresence();

  useEffect(() => {
    setAtmosphere(rootRef.current, 'victorious');
  }, []);

  return (
    <div className="makman-experience" data-phase={phase} data-presence={presence} ref={rootRef}>
      <div className="makman-reveal">
        {children}
      </div>

      <div className="makman-companion">
        <LivingCompanion
          message={COMPANION_MESSAGE}
          visible={true}
          textToSpeak={COMPANION_MESSAGE}
          context="makman-al-ghayah"
        />
      </div>
    </div>
  );
}
