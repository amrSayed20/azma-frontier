/**
 * AZMA OS — Sovereign Identity Orchestrator
 * DIRECTOR STAGE (Construction ID SIO-005B)
 *
 * The constitutional presentation space through which the certified
 * Director Engine (ACDE) expresses its scene-transition decisions. Mounted
 * once, at the platform level (app/layout.tsx), as a sibling of every
 * chamber's own content. It never wraps a chamber page, never mutates a
 * chamber page's DOM, and never intercepts or delays Next.js routing —
 * it only observes usePathname() and presents, after the fact, the
 * decision the Director Engine already made about the scene change that
 * just occurred.
 *
 * "The Director directs. The engines perform. The Stage presents."
 *
 * ISOLATION, BY CONSTRUCTION: every ACDE call below passes `null` as the
 * container/element argument. ACDE's DOM-mutating functions (beginTransition,
 * transitionArrive, transitionComplete, beginJourney, advanceJourney,
 * summonDirector, withdrawDirector) all guard on a truthy element/container
 * before touching the DOM (see src/design-system/direction.ts) — passing
 * null means ACDE performs no DOM mutation whatsoever and returns only its
 * decision data (a SceneTransition, a CinematicJourney). The Stage then
 * expresses that data through its own element, its own attributes
 * (data-director-stage-phase / data-director-stage-type), and its own
 * isolated stylesheet (director-stage.css) — none of which azma-direction.css
 * selects on. This is why no chamber page's already-shipping CSS can ever
 * collide with the Stage: ACDE's global rules are never applied to any
 * element the Stage renders, because ACDE is never given a real element
 * to mutate in the first place.
 *
 * JOURNEY CONTEXT, per Constitutional ruling (2026-07-11): this file
 * consumes exclusively ACDE's own journey primitives — CinematicJourney
 * (beginJourney/advanceJourney), Transition Context (SceneTransition),
 * SCENE_TRANSITIONS (via DirectorSession.beginTransition), and Direction
 * Memory (read only, through getMode(), which itself falls back to
 * readDirectionMemory().preferredMode — see direction.ts). It does not
 * import, reference, or depend on the separate Sovereign Journey Engine
 * (src/core/sovereign-journey). No bridge exists. None is authorized.
 *
 * "Journey Memory" and "Direction Memory" (both named in the authorizing
 * package) collapse onto the same single repository construct —
 * DirectionMemory (direction.ts) — no second memory store exists or is
 * invented here.
 *
 * CITIZEN MODE PACING: CITIZEN_MODES / getMode() are citizen-global, not
 * chamber-bound, so they are read directly from the certified
 * design-system barrel (the same source DirectorSession itself reads
 * from) rather than through a chamber-bound session — consistent with
 * how DirectorSession itself is scoped.
 *
 * SCOPE: only pathname changes that cross a defined ChamberContext
 * boundary (see route-context.ts) receive a Director-directed transition.
 * Navigations between two routes that both resolve to 'universal' are not
 * yet chamber transitions in ACDE's own model (SCENE_TRANSITIONS is keyed
 * on chamber ids) — extending transition treatment to them would require
 * inventing chamber identity ACDE was never given. Flagged here, not
 * silently assumed either way.
 *
 * THE IMPERIAL GATES ("The Law of Cinematic Continuity"): resolveSceneIdentity()
 * (route-context.ts) additionally recognizes 4 pre-auth routes (landing,
 * login, signup, subscription) as their own constitutional category,
 * distinct from Chambers — never merged into ROUTE_CHAMBER_IDS. Gate
 * transitions call ACDE's own beginTransition/advanceJourney functions
 * directly (imported below) rather than through a chamber-bound
 * DirectorSession, since those ACDE functions are already generic,
 * string-keyed pass-throughs with no chamber-specific behavior — see
 * director-session.ts's own forwarding methods. Existing Chamber-to-Chamber
 * behavior is completely unchanged; this is an additive branch, not a
 * rewrite.
 *
 * NO PERSISTENT JOURNEY MEMORY, BY CONSTITUTIONAL RULING: a real bridge to
 * the Sovereign Journey Engine would require reviving an entire
 * disconnected 14-step runtime kernel (src/core/azma-os-runtime/) —
 * disclosed rather than built. The Council explicitly ruled against a
 * temporary architectural substitute for that Responsibility ("the Living
 * Empire shall always prefer temporary functional limitation over
 * temporary architectural corruption"). DirectorStage therefore treats
 * every Gate arrival identically regardless of prior visits — no
 * first-time/returning distinction, no localStorage, nothing standing in
 * for the Sovereign Journey Engine. Persistent Journey Memory remains
 * reserved for a future, separately-authorized Constitutional Bridge
 * Package.
 *
 * CONSTITUTIONAL NERVOUS SYSTEM INTEGRATION (Integration Package "The
 * First Constitutional Signals"): this component reports the Sovereign
 * Identity Layer's and Sovereign Tongue's own lifecycle — availability on
 * mount, state on each chamber transition — inside the existing effects
 * below. No new JSX, no new DOM, no visual change: emitSignal() only
 * writes to the Nervous System's in-memory registries and calls listener
 * functions (none are registered anywhere yet).
 *
 * CONSTITUTIONAL CIRCULATION (Construction Phase III): upgraded from a
 * same-runtime report() to circulateFromClient(), which still emits
 * locally (zero behavior change for same-tab observers) but also
 * fire-and-forgets the signal to the server via
 * /api/sovereign/nervous-system/circulate, closing the browser→server
 * gap disclosed in the prior Integration Package. Never blocks, never
 * throws toward this component.
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import type { CSSProperties } from 'react';

import './director-stage.css';
import { createDirectorSession } from '../director-session';
import { resolveSceneIdentity } from './route-context';
import type { SceneIdentity } from './route-context';
import { CITIZEN_MODES, getMode, beginTransition, advanceJourney, beginJourney } from '../../design-system';
import type { SceneTransitionType, CinematicJourney } from '../../design-system';
import { isImperialGateId } from '../../imperial-gates/types';
import { circulateFromClient } from '../../sovereign-circulation';

type StagePhase = 'stable' | 'dissolving' | 'arriving';

export function DirectorStage() {
  const pathname = usePathname();

  const fromContextRef = useRef<SceneIdentity | null>(null);
  const journeyRef = useRef<CinematicJourney | null>(null);
  const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const frameRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<StagePhase>('stable');
  const [transitionType, setTransitionType] = useState<SceneTransitionType>('immediate');
  const [durationMs, setDurationMs] = useState(0);

  useEffect(() => {
    const toContext = resolveSceneIdentity(pathname);
    const fromContext = fromContextRef.current;

    // First mount: no prior scene to transition from. There is no scene
    // change to present — only its beginning. The journey opens silently.
    if (fromContext === null) {
      fromContextRef.current = toContext;
      journeyRef.current = isImperialGateId(toContext)
        ? beginJourney(null, 'creator-journey')
        : createDirectorSession(toContext).beginJourney(null, 'creator-journey');
      circulateFromClient({
        origin: 'sovereign-identity-layer',
        signalType: 'Availability',
        relatedEvent: 'Creator Arrived',
        reportingAuthority: 'sovereign-identity-layer',
        purpose: 'The Director Stage mounted and is available.',
        content: null,
      });
      circulateFromClient({
        origin: 'sovereign-tongue',
        signalType: 'Availability',
        relatedEvent: 'Creator Arrived',
        reportingAuthority: 'sovereign-tongue',
        purpose: 'A chamber context was resolved for the first time this session.',
        content: null,
      });
      return;
    }

    if (fromContext === toContext) return;

    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);

    // The Imperial Gates are recognized here, distinct from Chambers — see
    // this file's own header. Every Gate arrival is treated identically
    // regardless of prior visits — no persistent journey memory, per
    // Constitutional Ruling (2026-07-15).
    const transition = isImperialGateId(fromContext)
      ? beginTransition(null, fromContext, toContext)
      : createDirectorSession(fromContext).beginTransition(null, toContext);

    const mode = getMode();
    const pacedDurationMs = Math.round(
      transition.durationMs * CITIZEN_MODES[mode].pauseMultiplier,
    );

    if (journeyRef.current) {
      journeyRef.current = advanceJourney(null, journeyRef.current);
    }

    circulateFromClient({
      origin: 'sovereign-identity-layer',
      signalType: 'State',
      relatedEvent: 'Creator Entered Chamber',
      reportingAuthority: 'sovereign-identity-layer',
      purpose: 'A Director-directed scene transition began.',
      content: null,
    });
    circulateFromClient({
      origin: 'sovereign-tongue',
      signalType: 'State',
      relatedEvent: 'Creator Entered Chamber',
      reportingAuthority: 'sovereign-tongue',
      purpose: 'The tone context changed to a new chamber.',
      content: null,
    });

    setTransitionType(transition.transitionType);
    setDurationMs(pacedDurationMs);
    setPhase('dissolving');

    frameRef.current = requestAnimationFrame(() => {
      setPhase('arriving');
    });

    const settleTimeout = setTimeout(() => {
      setPhase('stable');
    }, pacedDurationMs + 32);

    // Hard failsafe: if the overlay hasn't settled after 3 s (any race
    // condition, browser throttle, etc.) force it to stable so the Creator
    // is never permanently trapped behind a black overlay.
    const failsafeTimeout = setTimeout(() => {
      setPhase('stable');
    }, 3000);

    timeoutsRef.current = [settleTimeout, failsafeTimeout];
    fromContextRef.current = toContext;
  }, [pathname]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(clearTimeout);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const style = { '--stage-duration': `${durationMs}ms` } as CSSProperties;

  return (
    <div
      className="azma-director-stage"
      data-director-stage-phase={phase}
      data-director-stage-type={transitionType}
      style={style}
      aria-hidden="true"
    />
  );
}
