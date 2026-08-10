'use client';

import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { t } from '@/src/creator-language';
import type { Dictionary, Locale } from '@/src/creator-language';
import { LocaleSwitcher } from '@/src/creator-language';
import type { AvailableAction } from '@/src/button-engine';
import { LivingCompanion } from '@/src/components/living-companion/LivingCompanion';
import { useInstallInvitation } from '@/src/install-experience';
import { getArrivalRecord, recordArrival, useVisitorPresence } from '@/src/visitor-presence';
import {
  getVariation,
  applyVariation,
  beginJourney,
  advanceJourney,
  endJourney,
  markEffectivePause,
  markInterruption,
  type CinematicJourney,
} from '@/src/design-system';
import { useExperienceLifecycle } from '../../engine';
import { selectCompanionMessageKey } from './select-companion-message';
import './arrival.css';

// Beat timing — see the file header for what each beat is and why it
// exists. Deliberately unhurried: "the pace belongs to understanding,
// not to animation." REVEAL_DURATION_MS must clear the last beat's own
// completion (~5.3s) before the Experience settles into 'stable', or
// the Design System's own .is-appearing reveal gets cut mid-animation.
const REVEAL_DURATION_MS = 5600;
const HANDOFF_DURATION_MS = 900;

// PACKAGE IV — useSyncExternalStore, not an effect + setState: this
// value differs between the server (no localStorage, always "new")
// and the client (may genuinely be returning), and must be correct at
// first client paint without a hydration mismatch or a manual
// corrective re-render. There is nothing to subscribe to, so subscribe
// is a permanent no-op.
//
// REAL BUG, caught only by watching the running page across its full
// beat sequence, not by reading the code: getSnapshot must return a
// STABLE value across a component's whole lifetime once React starts
// calling it on every render (which it does, unconditionally, on top
// of the no-op subscription) — reading getArrivalRecord() fresh each
// time meant the very same mount effect that WRITES the incremented
// record (below) made every snapshot check AFTER that write see "a
// record exists" and silently flip isReturning from false to true
// mid-session — at the entering→stable transition specifically, since
// that's what triggers the next re-render — with no real return visit
// having happened. Fixed by freezing the answer the first time it is
// read; the module is re-evaluated fresh per real page load in the
// browser, so this correctly resets every genuine new visit.
let cachedIsReturning: boolean | null = null;
function subscribeToNothing(): () => void {
  return () => {};
}
function getIsReturningSnapshot(): boolean {
  if (cachedIsReturning === null) {
    cachedIsReturning = getArrivalRecord() !== null;
  }
  return cachedIsReturning;
}
function getIsReturningServerSnapshot(): boolean {
  return false;
}

interface Props {
  readonly title: string;
  readonly actions: readonly AvailableAction[];
  readonly dict: Dictionary;
  readonly locale: Locale;
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The Arrival Experience — Constitutional Package I-VIII implementation
 *
 * PRODUCTION CONSTRUCTION (2026-07-20), built directly from the
 * Constitution, the Vision, the Encounter, the Character, the Visitor,
 * the Timeline, the Script, and the Storyboard — not from any prior
 * prototype. The previous Welcome/Arrival builds (card+panel layout,
 * cinematic photo migration, every correction pass after it) were
 * ruled exploratory-only and removed entirely; nothing here reuses
 * their files, CSS, or layout decisions.
 *
 * This is one continuous scene, not a sequence of sections: a single
 * full-viewport composition where every element is a beat in the
 * Storyboard, not an independent "component." There is no photograph —
 * every prior image asset carried real problems (baked text, resolution
 * limits, an unrecoverable source-file loss) that a code-only
 * atmosphere does not have, and "design only what naturally emerges
 * from the constitutional documents" reads as license to leave
 * borrowed imagery behind, not just correct it again.
 *
 * THE BEATS (Storyboard I-VIII), and where each lives below:
 *   1. The Knock       — belongs to the visitor; nothing to render.
 *   2. Awareness       — .arrival-awareness: a soft bloom brightening
 *                         before anything else exists, the Empire's
 *                         attention turning toward the visitor.
 *   3. Responsibility  — a held silence between beats 2 and 4; honored
 *                         by scheduling nothing in that window, not by
 *                         faking a pause with a spinner.
 *   4. Revelation      — the certified Seal (.azma-el-seal, Design
 *                         System) — "contains a glyph only... speaks in
 *                         form, not words." First identity mark shown.
 *   5. Recognition     — the wordmark, the tagline, and (only for a
 *                         returning, already-known Creator) the
 *                         session-aware line. A stranger is never asked
 *                         to declare anything — recognition is felt
 *                         through presence, not demanded through a form.
 *   6. Invitation       — .arrival-threshold: sensed, not chromed. One
 *                         path only — no parallel "sign in" choice on
 *                         this scene; a returning Creator without an
 *                         active session finds their way back via
 *                         /signup's own footer link one screen later,
 *                         not competing here for the visitor's choice.
 *   7. The Chosen Step — the visitor's own click; beginHandoff() is the
 *                         only thing this file does in response.
 *   8. Quiet Confirmation — the Seal's own is-completing lifecycle
 *                         (clip-path circle expanding, fading — "the
 *                         architecture makes way") carries the exit.
 *                         No crimson, no particles, no light-burst:
 *                         "nothing exists to impress."
 *
 * The Language control and LivingCompanion are not Storyboard beats —
 * they are standing capabilities (real i18n, real presence/companionship,
 * "the visitor must never feel alone") rather than narrative moments, so
 * they are not gated behind the beat sequence the same way.
 *
 * PACKAGE II — ARRIVAL INTEGRATION LAYER (2026-07-21): an audit before
 * Package I found seven of ten requested "runtime engines" already
 * real and ratified, just unconsumed by Arrival. This package wires
 * this Experience to them for real — orchestration, not duplication —
 * without changing the approved visual output (no redesign, per the
 * Council's own instruction for this package):
 *   - Arrival Detection + Presence: recordArrival() (src/visitor-
 *     presence) supplies a real device-level visit count for the first
 *     time; getVariation(arrivalCount) — dead code until now — produces
 *     a genuine ±8% living variation applied to the ambient breathing
 *     rate only (--arrival-breath-scale), not to beat timing, which
 *     stays fixed. useVisitorPresence() drives data-presence, pausing
 *     ambient animation while the tab is actually hidden.
 *   - Cinematic Timeline: beginJourney/advanceJourney/endJourney (ACDE,
 *     src/design-system/direction.ts) are called for real across the
 *     lifecycle — mount, the entering→stable settle, and the chosen
 *     step — genuinely establishing the connection this package asks
 *     for. PACKAGE III gave the resulting data-journey-depth attribute
 *     its first CSS consumer (arrival.css) — a subtle brightness
 *     settling once depth reaches 1, not a new cinematic sequence.
 *   - Emotional Timeline: markInterruption('arrival') if the visitor
 *     crosses the threshold before the reveal settles, markEffective-
 *     Pause('arrival', elapsed) if they wait — real signals persisted
 *     into ACDE's own DirectionMemory for future pacing decisions.
 *   - Imperial Voice Layer: LivingCompanion already consumed it before
 *     this package (verified, not rebuilt) — no ChamberContext value
 *     exists for the Gate, so 'universal' (the default) is correct
 *     as-is, not a gap.
 *   - Narrative Runtime: the Sovereign Journey Engine bridge remains
 *     explicitly not authorized (DirectorStage.tsx's own disclosure) —
 *     unchanged by this package. ACDE's CinematicJourney/EmotionalBeat
 *     above serve Arrival's own within-page narrative instead.
 *   - Living Motion System: arrival.css now references the Design
 *     System's own global breathing tokens (--azma-breath-accent,
 *     --azma-breath-echo, --azma-breath) instead of locally-invented
 *     magic numbers — two were already numerically identical by
 *     coincidence; the atmosphere breathe genuinely slows to the
 *     ratified 80s primary period, in the spirit of "silence is
 *     luxury," a timing-only change to an already-subtle 6%
 *     brightness pulse, not a compositional redesign.
 *
 * PACKAGE IV — first behavioral layer of the Encounter (2026-07-21):
 * the Empire's one existing behavioral voice — LivingCompanion, real
 * since before Package II — now genuinely differs by whether
 * recordArrival() (Package I) recognizes this device, using a value it
 * already computed and previously discarded after feeding
 * getVariation(). No new system: same companion, same position, same
 * beat timing, same Imperial Voice Layer underneath — only which
 * dictionary key is chosen changes. Deliberately device-level, not
 * identity-level: "the Empire still sees you," never "welcome back,
 * {name}" — that stays reserved for genuine, session-authenticated
 * recognition (Beat 5), never implied from a browser alone.
 *
 * PACKAGE V — IMPERIAL COMPANIONSHIP LAYER (2026-07-21): the companion
 * now also acknowledges idle presence and the chosen step itself, not
 * only device recognition — see select-companion-message.ts for the
 * one policy function that decides between all four messages, and why
 * it exists as a single pure function rather than more ad hoc ternaries
 * (the standing rule that raw signals must not become presentation
 * logic directly applies just as much to scattering several of them
 * through render as to one). LivingCompanion.tsx itself gained a
 * crossfade for genuine content changes — a shared, backward-compatible
 * fix (Hujjah and the Vault Palace already change this same message
 * over time and are unaffected unless their own CSS opts in), not an
 * Arrival-only parallel implementation.
 */
export function ArrivalExperience({ title, actions, dict, locale }: Props) {
  const { phase, beginHandoff } = useExperienceLifecycle({
    revealDurationMs: REVEAL_DURATION_MS,
    handoffDurationMs: HANDOFF_DURATION_MS,
  });

  const { platform, openManually } = useInstallInvitation();
  const showInstallAffordance = platform !== 'unsupported' && platform !== 'already-installed';

  const rootRef = useRef<HTMLElement | null>(null);
  const journeyRef = useRef<CinematicJourney | null>(null);
  const mountedAtRef = useRef<number>(0);
  const presence = useVisitorPresence();

  // Whether this device arrived before THIS visit (see
  // getIsReturningSnapshot above) — read once via useSyncExternalStore
  // rather than an effect+setState, so the server/first-client-paint
  // value (always false, no localStorage on the server) and the real
  // client value never fight each other or trigger a hydration
  // mismatch or a manual corrective render.
  const isReturning = useSyncExternalStore(subscribeToNothing, getIsReturningSnapshot, getIsReturningServerSnapshot);

  useEffect(() => {
    const node = rootRef.current;
    mountedAtRef.current = Date.now();

    // recordArrival() has a real side effect (localStorage) and the
    // resulting variation is applied imperatively via the DOM, the
    // same pattern ACDE's own beginJourney/setAtmosphere already use
    // below — not React state, so there is no render-phase read of a
    // value that can only ever be known after mount. Its WRITE (the
    // incremented count) happens here, deliberately after render/commit
    // — isReturning above already captured the PRE-this-visit answer at
    // first render, which is the semantically correct value; nothing
    // needs to react to this write.
    const record = recordArrival();
    const variation = getVariation(record.arrivalCount);
    node?.style.setProperty('--arrival-breath-scale', String(variation.breathScale));
    applyVariation(node, record.arrivalCount);

    journeyRef.current = beginJourney(node, 'arrival');

    return () => {
      endJourney(node);
    };
  }, []);

  useEffect(() => {
    if (phase === 'stable' && journeyRef.current) {
      journeyRef.current = advanceJourney(rootRef.current, journeyRef.current);
    }
  }, [phase]);

  // The one path forward — 'enter-as-explorer' (Registration) or
  // 'enter-chamber' (a returning, already-authenticated Creator). No
  // parallel choice is offered from this scene (see file header).
  const primaryAction = actions.find((action) => action.id !== 'enter-as-member');

  // PACKAGE IV/V — behavioral acknowledgment, never identity or a form:
  // see select-companion-message.ts for the full policy and priority
  // order (chosen step > idle > returning > default).
  const companionMessageKey = selectCompanionMessageKey({ phase, presence, isReturning });

  const crossThreshold = useCallback(() => {
    const elapsedMs = Date.now() - mountedAtRef.current;
    if (phase === 'entering') {
      markInterruption('arrival');
    } else {
      markEffectivePause('arrival', elapsedMs);
    }
    if (journeyRef.current) {
      journeyRef.current = advanceJourney(rootRef.current, journeyRef.current);
    }
    if (primaryAction?.href) beginHandoff(primaryAction.href);
  }, [phase, primaryAction, beginHandoff]);

  return (
    <main className="arrival" data-phase={phase} data-presence={presence} ref={rootRef}>
      <div className="arrival-atmosphere" aria-hidden="true" />
      <div className="arrival-awareness" aria-hidden="true" />

      <div className="arrival-presence">
        {/*
          The Seal: the Design System's own already-certified ceremonial
          element (ELEMENT_SEAL / .azma-el-seal). Its composition rule —
          "contains a glyph only, may NOT contain text" — is honored
          with a plain geometric compass-rosette, not a borrowed
          character from any writing system.
        */}
        <div
          className={
            'azma-el-seal arrival-seal' +
            (phase === 'entering' ? ' is-appearing' : '') +
            (phase === 'exiting' ? ' is-completing' : '')
          }
          data-seal="seal"
          aria-hidden="true"
        >
          <svg viewBox="0 0 32 32" className="arrival-seal-mark" aria-hidden="true">
            <circle cx="16" cy="16" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path
              d="M16 6 L18.4 13.6 L26 16 L18.4 18.4 L16 26 L13.6 18.4 L6 16 L13.6 13.6 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="2" fill="currentColor" />
          </svg>
        </div>

        <h1 className="arrival-wordmark">{t(dict, 'gate.wordmark')}</h1>
        <p className="arrival-recognition">{t(dict, 'gate.tagline')}</p>
        {title && <p className="arrival-session-line">{title}</p>}
      </div>

      {primaryAction && (
        <button
          type="button"
          className="arrival-threshold"
          onClick={crossThreshold}
          aria-label={t(dict, primaryAction.labelKey)}
        >
          <span className="arrival-threshold-glow" aria-hidden="true" />
          <span className="arrival-threshold-caption" aria-hidden="true">{t(dict, 'gate.thresholdCaption')}</span>
        </button>
      )}

      <div className="arrival-language">
        <LocaleSwitcher
          currentLocale={locale}
          triggerLabel={t(dict, 'gate.languageLabel')}
          menuLabel={t(dict, 'gate.chooseLanguage')}
        />
      </div>

      <div className="arrival-companion">
        <LivingCompanion
          message={t(dict, companionMessageKey)}
          visible={true}
          textToSpeak={t(dict, companionMessageKey)}
          locale={locale}
        />
        {showInstallAffordance && (
          <button type="button" className="arrival-install-affordance" onClick={openManually}>
            ⇩ Install
          </button>
        )}
      </div>
    </main>
  );
}
