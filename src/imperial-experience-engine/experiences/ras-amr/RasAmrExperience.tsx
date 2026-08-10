'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { getArrivalRecord, useVisitorPresence } from '@/src/visitor-presence';
import { applyVariation, setAtmosphere } from '@/src/design-system';
import { useExperienceLifecycle } from '../../engine';
import './ras-amr-experience.css';

const REVEAL_DURATION_MS = 500;

/** Arabic-only, hardcoded — matching this page's own existing reality:
    every other string on app/ras-amr/page.tsx is a hardcoded Arabic
    literal, no dict/locale system is wired in there at all. Introducing
    bilingual copy for only the companion would be an inconsistency this
    package doesn't create; the LivingCompanion `locale` prop is left
    unset, which already defaults to 'ar-SA' per its own contract. */
const COMPANION_MESSAGE = 'الإمبراطورية تُخرج معك';

interface Props {
  readonly children: ReactNode;
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Ras Al Amr Experience
 *
 * IMPERIAL CHAMBER UNIFICATION, PACKAGE I (2026-07-23): the fifth
 * registered Experience Pipeline, built the same way as Qiyamah
 * Chamber's (see experiences/qiyamah-chamber/) — additive only. The
 * live page (app/ras-amr/page.tsx) had zero IXE/Presence/Atmosphere/
 * Voice integration; this wrapper adds exactly that and nothing else.
 *
 * NOT TOUCHED, ZERO OVERLAP: the ~85-file certified "Living Runtime
 * Core" constitutional record under src/chambers/ras-al-amr/ (Packages
 * I-IV of a separate, earlier initiative) — confirmed by audit to be
 * imported by nothing outside itself, so this wrapper cannot conflict
 * with it. Also not touched: the page's own local-state "Master
 * Render"/Summoning Bridge logic, its CSS, or its one real but
 * currently-unreachable backend capability (POST
 * /api/sovereign/entry/ras-al-amr/compile) — by explicit Council
 * directive, production capability is deferred to a later, separate
 * package once Qiyamah, Ras Al Amr, and Makman have all completed this
 * same reconstruction.
 *
 * Atmosphere: 'deliberating' ("the moment before judgment... weight,
 * consequence, this moment matters") — not previously used by any
 * chamber, and fits a director's console compiling a draft into a
 * locked, ready-to-publish assembly better than 'creating' (Qiyamah,
 * origination from nothing) or 'calm' (the Gates).
 */
export function RasAmrExperience({ children }: Props) {
  const { phase } = useExperienceLifecycle({
    revealDurationMs: REVEAL_DURATION_MS,
    handoffDurationMs: 0,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const presence = useVisitorPresence();

  useEffect(() => {
    setAtmosphere(rootRef.current, 'deliberating');
    applyVariation(rootRef.current, getArrivalRecord()?.arrivalCount ?? 0);
  }, []);

  return (
    <div className="ras-amr-experience" data-phase={phase} data-presence={presence} ref={rootRef}>
      <div className="ras-amr-reveal">
        {children}
      </div>

      <div className="ras-amr-companion">
        <LivingCompanion
          message={COMPANION_MESSAGE}
          visible={true}
          textToSpeak={COMPANION_MESSAGE}
          context="ras-amr"
        />
      </div>
    </div>
  );
}
