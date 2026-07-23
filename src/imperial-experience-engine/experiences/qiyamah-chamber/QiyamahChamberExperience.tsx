'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { useVisitorPresence } from '@/src/visitor-presence';
import { setAtmosphere } from '@/src/design-system';
import { useExperienceLifecycle } from '../../engine';
import './qiyamah-chamber-experience.css';

const REVEAL_DURATION_MS = 500;

interface Props {
  /** Plain children, not a render function — unlike Signup/Login, entering
      the Chamber has no single success moment that hands off elsewhere;
      the Creator stays and may generate many times. No beginHandoff this
      package (Launch Gate: a multi-generation exit ceremony is an
      enhancement, not a launch blocker) — see the accompanying brief. */
  readonly children: ReactNode;
  readonly dict: Dictionary;
  readonly locale: Locale;
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Qiyamah Chamber Experience
 *
 * QIYAMAH CHAMBER, PACKAGE I — CONSTITUTIONAL ARCHITECTURE (2026-07-23):
 * the fourth registered Experience Pipeline, and the first to be a
 * Chamber rather than a Gate. Qiyamah's real generation backend, gating,
 * and gallery (src/qiyamah-generation/, app/api/qiyamah/*) already work
 * end to end — this package does not touch any of that. What Qiyamah
 * lacked was the invisible runtime every Gate already shares: a
 * lifecycle-driven reveal, Presence Engine tracking, and an Imperial
 * Voice companion. It had none of the three.
 *
 * THE CRIMSON THEME IS KEPT, NOT REPLACED: qiyamah-chamber.css's own
 * header already documents its crimson identity as a deliberately
 * ratified per-chamber override (Constitutional Dossier Chapter III
 * Article V, "chamber personality vs platform identity"), not an
 * oversight. This wrapper is additive only — it does not touch
 * QiyamahChamberClient or its stylesheet. The Atmosphere Runtime call
 * below ('creating' — "the citizen makes something, the palace
 * participates," per design-system/behaviors.ts) sets a data-attribute
 * for constitutional consistency with every other Experience; because
 * the Chamber's own viewport is a full-screen, opaque, fixed element,
 * the atmosphere's gradient layer would be entirely hidden behind it, so
 * no such layer is rendered here — only the reveal fade and the
 * companion are visually real additions.
 *
 * QIYAMAH CHAMBER, PACKAGE III — BEHAVIORAL CONSTITUTION (2026-07-23):
 * the companion now passes context="qiyamah-chamber" — the prop already
 * existed and was already used by Palace/Hujjah, simply omitted here.
 * With Package II's corrected Tongue identity, this connects the
 * already-built companion to its own already-corrected voice (affects
 * only TTS rate/pitch in voice mode; see src/core/tongue/voice.ts and
 * the retuned src/design-system/direction.ts ChamberScore).
 */
export function QiyamahChamberExperience({ children, dict, locale }: Props) {
  const { phase } = useExperienceLifecycle({
    revealDurationMs: REVEAL_DURATION_MS,
    handoffDurationMs: 0,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const presence = useVisitorPresence();

  useEffect(() => {
    setAtmosphere(rootRef.current, 'creating');
  }, []);

  return (
    <div className="qiyamah-chamber-experience" data-phase={phase} data-presence={presence} ref={rootRef}>
      <div className="qiyamah-chamber-reveal">
        {children}
      </div>

      <div className="qiyamah-chamber-companion">
        <LivingCompanion
          message={t(dict, 'qiyamah.companionMessage')}
          visible={true}
          textToSpeak={t(dict, 'qiyamah.companionMessage')}
          context="qiyamah-chamber"
          locale={locale}
        />
      </div>
    </div>
  );
}
