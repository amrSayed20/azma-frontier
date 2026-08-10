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
// Long enough for the birth acknowledgment to register, short enough
// that the visitor never feels held up on their way to their Chamber.
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
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Registration Gateway
 *
 * PACKAGE I — Atmosphere & Presence Continuity (2026-07-23):
 * "Crossing from '/' to '/signup' is not navigation. It is the
 * continuation of the same encounter." Second real Experience Pipeline
 * IXE hosts (see engine/experience-registry.ts), reusing the exact same
 * shared Lifecycle Arrival already runs on.
 *
 * DELIBERATELY DOES NOT TOUCH THE FORM: SignupForm.tsx's fields,
 * labels, and validation are rendered unmodified — this file only
 * wraps it in atmosphere, Imperial Voice, and pacing.
 *
 * WHAT MAKES THIS CONTINUATION, NOT A NEW PLACE:
 *   - Same 'calm' Atmosphere Runtime call Arrival already uses.
 *   - Same Living Motion System breathing tokens — no new timing invented.
 *   - Same Presence Engine (useVisitorPresence), reused directly.
 *   - Same Imperial Voice Layer (LivingCompanion), present here for the
 *     first time on this route.
 *   - Deliberately NOT reused: Package I's recordArrival()/isReturning —
 *     "has this device reached the Gate before" is a different question
 *     from "is this Creator now registering."
 *   - Deliberately brief reveal (550ms, not Arrival's ~5.6s) — a form
 *     the visitor needs to use should never feel artificially delayed.
 *   - The '/' → '/signup' transition itself is not reimplemented here:
 *     ACDE's own 'landing-to-signup' SCENE_TRANSITIONS entry already
 *     existed and was already wired through DirectorStage — verified
 *     live, not rebuilt.
 *
 * PACKAGE II — CREATOR BIRTH TRANSITION (2026-07-23): successful
 * registration no longer calls router.push directly from inside the
 * form. SignupForm now accepts an optional onSuccess callback; this
 * component supplies one that calls beginHandoff('/qiyamah-chamber') —
 * the exact same ceremonial-handoff mechanism Arrival already uses for
 * its own threshold, not a second implementation of the idea. During
 * the resulting 'exiting' phase: the Companion's message changes (the
 * same crossfade mechanism built for Arrival's Package V, reused
 * as-is) to a birth-specific acknowledgment, and the form recedes via
 * signup-experience.css rather than vanishing instantly. The route
 * transition into Qiyamah itself is carried by a new, pattern-matching
 * 'signup-to-qiyamah-chamber' SCENE_TRANSITIONS entry (direction.ts) —
 * the one pairing missing from an otherwise-complete set (subscription
 * and login already had theirs) — not a new transition system.
 */
export function SignupExperience({ children, dict, locale }: Props) {
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
    <div className="signup-experience" data-phase={phase} data-presence={presence} ref={rootRef}>
      <div className="signup-atmosphere" aria-hidden="true" />

      <div className="signup-reveal">
        {children(handleRegistrationSuccess)}
      </div>

      <div className="signup-companion">
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
