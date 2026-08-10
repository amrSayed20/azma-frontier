'use client';

import { type ReactNode, useEffect, useRef, useState } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { getArrivalRecord, useVisitorPresence } from '@/src/visitor-presence';
import { applyVariation } from '@/src/design-system';
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

  const [companionMsg, setCompanionMsg] = useState<string>(() => t(dict, 'qiyamah.companionMessage'));

  // IMPERIAL JOURNEY CONTINUITY — Package D:
  // Consume the kernel session the Foyer wrote before launching this chamber,
  // the investigation context Hujjah wrote when transferring here,
  // and the treasure context the Palace wrote when directing here.
  // All three keys are consumed (removed) immediately — they must not linger.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const kernelRaw = sessionStorage.getItem('azma.kernel.session');
    if (kernelRaw) sessionStorage.removeItem('azma.kernel.session');

    const investigationRaw = sessionStorage.getItem('azma.transfer.investigation');
    if (investigationRaw) sessionStorage.removeItem('azma.transfer.investigation');

    const treasureRaw = sessionStorage.getItem('azma.transfer.treasure');
    if (treasureRaw) sessionStorage.removeItem('azma.transfer.treasure');
    sessionStorage.removeItem('azma.transfer.origin');

    if (investigationRaw) {
      // Creator arrived from Hujjah after an investigation — the most specific context
      setCompanionMsg('قادم من حجرة المعرفة — القيامة تحوّل ما تعلمته إلى وجود');
    } else if (treasureRaw) {
      setCompanionMsg('الكنز وصل — القيامة تستعدّ لتحويله إلى عمل');
    } else if (kernelRaw) {
      try {
        const s = JSON.parse(kernelRaw) as { status?: string };
        if (s?.status === 'RESOLVED') {
          setCompanionMsg('الإمبراطورية أعدّت هذه الجلسة — حجرة القيامة تستقبلك');
        }
      } catch { /* ignore malformed session */ }
    }
  }, []);

  useEffect(() => {
    applyVariation(rootRef.current, getArrivalRecord()?.arrivalCount ?? 0);
  }, []);

  return (
    <div className="qiyamah-chamber-experience" data-phase={phase} data-presence={presence} ref={rootRef}>
      <div className="qiyamah-chamber-reveal">
        {children}
      </div>

      <div className="qiyamah-chamber-companion">
        <LivingCompanion
          message={companionMsg}
          visible={true}
          textToSpeak={companionMsg}
          context="qiyamah-chamber"
          locale={locale}
        />
      </div>
    </div>
  );
}
