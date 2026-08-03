'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { useVisitorPresence } from '@/src/visitor-presence';
import { setAtmosphere } from '@/src/design-system';
import { useExperienceLifecycle } from '../../engine';
import './makman-experience.css';

const REVEAL_DURATION_MS = 500;

/** Default message — the Chamber's constitutional name means "purpose has
    been reached." Used when no richer journey context is available. */
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

  const [companionMsg, setCompanionMsg] = useState<string>(COMPANION_MESSAGE);

  // IMPERIAL JOURNEY CONTINUITY — Package D:
  // Consume the kernel session the Foyer wrote, and the treasure context
  // the Palace wrote when directing the Creator here.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const kernelRaw = sessionStorage.getItem('azma.kernel.session');
    if (kernelRaw) sessionStorage.removeItem('azma.kernel.session');

    const treasureRaw = sessionStorage.getItem('azma.transfer.treasure');
    if (treasureRaw) sessionStorage.removeItem('azma.transfer.treasure');
    sessionStorage.removeItem('azma.transfer.origin');

    if (treasureRaw) {
      setCompanionMsg('كنز القصر بلغ غايته — هنا يكتمل المسار');
    } else if (kernelRaw) {
      try {
        const s = JSON.parse(kernelRaw) as { status?: string };
        if (s?.status === 'RESOLVED') {
          setCompanionMsg('الإمبراطورية أعدّت هذه الجلسة — مكمن الغاية يستقبلك');
        }
      } catch { /* ignore malformed session */ }
    }
  }, []);

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
          message={companionMsg}
          visible={true}
          textToSpeak={companionMsg}
          context="makman-al-ghayah"
        />
      </div>
    </div>
  );
}
