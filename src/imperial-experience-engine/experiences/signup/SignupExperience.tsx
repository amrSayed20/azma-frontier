'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { getArrivalRecord, useVisitorPresence } from '@/src/visitor-presence';
import { applyVariation } from '@/src/design-system';
import { useExperienceLifecycle } from '../../engine';
import './signup-experience.css';

const REVEAL_DURATION_MS = 550;
// PACKAGE II: brief on purpose — "do not introduce artificial delays."
// Long enough for the acknowledgment to register, short enough that the
// visitor never feels held up on their way to their room.
const HANDOFF_DURATION_MS = 700;

interface Props {
  /**
   * A render function, not a plain node — PACKAGE II needs to hand the
   * ceremonial handoff trigger down to SignupForm's own success path
   * without this file importing app/signup/SignupForm.tsx directly
   * (src/ depending on app/ would invert this codebase's own dependency
   * direction). app/signup/page.tsx supplies the actual form.
   */
  readonly children: (onSuccess: () => void) => ReactNode;
  readonly dict: Dictionary;
  readonly locale: Locale;
  /**
   * «الإيوان», 2026-11-23: the hashed, self-hosted face `app/signup/page.tsx`
   * declares for THIS route alone, handed down as a CSS variable this
   * experience's own stylesheet reads. `app/layout.tsx` is not this page's to
   * touch — it is loaded by every surface in the Empire — and `next/font`
   * does not require it. No chamber sees this face.
   */
  readonly fontClass?: string;
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * «الإيوان» — The Entrance Hall
 *
 * PACKAGE I — Atmosphere & Presence Continuity (2026-07-23):
 * "Crossing from '/' to '/signup' is not navigation. It is the
 * continuation of the same encounter." Second real Experience Pipeline
 * IXE hosts (see engine/experience-registry.ts), reusing the exact same
 * shared Lifecycle Arrival already runs on.
 *
 * WHAT MAKES THIS CONTINUATION, NOT A NEW PLACE:
 *   - Same Living Motion System breathing tokens — no new timing invented.
 *   - Same Presence Engine (useVisitorPresence), reused directly.
 *   - Same Imperial Voice Layer (LivingCompanion).
 *   - Deliberately NOT reused: Package I's recordArrival()/isReturning —
 *     "has this device reached the Gate before" is a different question
 *     from "is this Creator now registering."
 *   - Deliberately brief reveal (550ms, not Arrival's ~5.6s) — a door the
 *     visitor needs to use should never feel artificially delayed.
 *
 * PACKAGE II — THE ACCEPTED ACCOUNT (2026-07-23): successful registration
 * no longer calls router.push directly from inside the form. SignupForm
 * accepts an optional onSuccess callback; this component supplies one that
 * calls beginHandoff('/imperial-foyer') — the exact same ceremonial-handoff
 * mechanism Arrival already uses for its own threshold, not a second
 * implementation of the idea. During the resulting 'exiting' phase the
 * Companion's message changes (the same crossfade built for Arrival's
 * Package V, reused as-is) and the hall recedes via the stylesheet rather
 * than vanishing instantly.
 *
 * ─── «الإيوان», 2026-11-23 — WHAT THIS PACKAGE CHANGED ─────────────────────
 *
 *   The structural class names became `iwan-*`, one exclusive prefix for this
 *   surface, verified against the repository as unused before it was chosen
 *   (`gate-` belongs to the Vault, `gi-` to the gateway, `lp-` to the
 *   landing). And the `.companion-*` rules this page needs — which belong to
 *   LivingCompanion, a component this page hosts but does not own — are now
 *   written as descendants of `.iwan-voice`, so this page's voice styling
 *   cannot reach any other room's copy of that component.
 *
 *   The lifecycle, the presence signal, the variation call and the voice are
 *   untouched engines. A visual package does not retire machinery.
 */
export function SignupExperience({ children, dict, locale, fontClass = '' }: Props) {
  const { phase, beginHandoff } = useExperienceLifecycle({
    revealDurationMs: REVEAL_DURATION_MS,
    handoffDurationMs: HANDOFF_DURATION_MS,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const presence = useVisitorPresence();

  useEffect(() => {
    applyVariation(rootRef.current, getArrivalRecord()?.arrivalCount ?? 0);
  }, []);

  const handleRegistrationSuccess = () => {
    beginHandoff('/imperial-foyer');
  };

  const companionMessageKey = phase === 'exiting' ? 'signup.companionMessageBorn' : 'signup.companionMessage';

  return (
    <div
      className={`iwan-stage ${fontClass}`.trim()}
      data-phase={phase}
      data-presence={presence}
      ref={rootRef}
    >
      {/* الضوءُ الواحدُ والجدارُ البعيد — زخرفيٌّ بالكامل، ولا يَلتقِط لمسة. */}
      <div className="iwan-atmosphere" aria-hidden="true">
        <span className="iwan-beam" />
        <span className="iwan-screen" />
        <span className="iwan-hearth" />
        <span className="iwan-ground" />
      </div>

      <div className="iwan-reveal">
        {children(handleRegistrationSuccess)}
      </div>

      <div className="iwan-voice">
        <LivingCompanion
          message={t(dict, companionMessageKey)}
          visible={true}
          textToSpeak={t(dict, companionMessageKey)}
          locale={locale}
        />
      </div>
    </div>
  );
}
