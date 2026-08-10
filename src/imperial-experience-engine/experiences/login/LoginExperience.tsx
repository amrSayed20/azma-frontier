'use client';

import { type ReactNode, useEffect, useRef } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { getArrivalRecord, useVisitorPresence } from '@/src/visitor-presence';
import { applyVariation, setAtmosphere } from '@/src/design-system';
import { useExperienceLifecycle } from '../../engine';
import './login-experience.css';

const REVEAL_DURATION_MS = 550;
// Same brief handoff duration as Signup's — the constitutional
// objective differs (recognition, not birth), the pacing does not:
// "do not introduce artificial delays" applies equally to both.
const HANDOFF_DURATION_MS = 700;

interface Props {
  /** See SignupExperience.tsx for why this is a render function, not a
      plain node — the same Server→Client render-prop constraint applies
      here. Called with the role-resolved destination on success. */
  readonly children: (onSuccess: (destination: string) => void) => ReactNode;
  readonly dict: Dictionary;
  readonly locale: Locale;
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Recognition Gateway
 *
 * CONSTITUTIONAL DIRECTIVE (2026-07-23): "Do not replicate the Signup
 * experience for Login. The Returning Creator is not a Visitor. The
 * Returning Creator is someone the Empire already knows." Login
 * therefore pursues a deliberately different objective at every layer
 * that carries meaning, while reusing every mechanism verbatim:
 *
 *   Signup                          Login
 *   ──────────────────────────────  ──────────────────────────────
 *   Birth                           Recognition
 *   Introduction                    Continuity
 *   Arrival                         Belonging
 *   "You have not left the Empire"  "The Empire knows you"
 *   "You are born a Creator, come"  "Welcome back" — the EXACT phrase
 *                                   already used for a known Creator
 *                                   at Arrival (gate.titleKnownDefault),
 *                                   deliberately echoed rather than
 *                                   reworded: continuity of language,
 *                                   not just of mechanism.
 *
 * REUSED VERBATIM, THIRD TIME NOW: IXE's shared Lifecycle
 * (useExperienceLifecycle — this is the third registered Experience
 * Pipeline), the 'calm' Atmosphere Runtime call, the Living Motion
 * System breathing tokens, the Presence Engine, the Imperial Voice
 * Layer including its Package V crossfade, and the beginHandoff()
 * ceremonial-exit mechanism Arrival and Signup both already use. No
 * new runtime, per the Council's own repeated constraint — only new
 * words in the same voice.
 *
 * ROLE-AWARE, NOT ROLE-DUPLICATED: LoginForm serves both a Creator and
 * a Founder (same authentication, different post-login destination).
 * The ceremony itself (atmosphere, recognition, the Empire "knowing"
 * this visitor) is deliberately identical for both — a Founder is also
 * someone the Empire already knows — only the destination handed to
 * beginHandoff differs, computed by LoginForm exactly as before and
 * passed through, not reimplemented here.
 */
export function LoginExperience({ children, dict, locale }: Props) {
  const { phase, beginHandoff } = useExperienceLifecycle({
    revealDurationMs: REVEAL_DURATION_MS,
    handoffDurationMs: HANDOFF_DURATION_MS,
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const presence = useVisitorPresence();

  useEffect(() => {
    setAtmosphere(rootRef.current, 'calm');
    applyVariation(rootRef.current, getArrivalRecord()?.arrivalCount ?? 0);
  }, []);

  const handleRecognized = (destination: string) => {
    beginHandoff(destination);
  };

  const companionMessageKey = phase === 'exiting' ? 'login.companionMessageRecognized' : 'login.companionMessage';

  return (
    <div className="login-experience" data-phase={phase} data-presence={presence} ref={rootRef}>
      <div className="login-atmosphere" aria-hidden="true" />

      <div className="login-reveal">
        {children(handleRecognized)}
      </div>

      <div className="login-companion">
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
