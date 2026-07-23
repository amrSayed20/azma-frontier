/**
 * AZMA OS — Sovereign Identity Orchestrator
 * DIRECTOR SESSION (Construction ID SIO-005)
 *
 * Coordinates the existing Cinematic Direction Engine (ACDE,
 * src/design-system/direction.ts) through the certified Sovereign
 * Identity Orchestrator. This is a thin, chamber-bound facade over
 * ACDE's own functions — it re-implements nothing, redesigns nothing,
 * and replaces no constitutional engine. Every method below is a direct
 * pass-through to an already-certified ACDE export.
 *
 * SCOPE, deliberately narrow — read SIO_005_ENGINEERING_REVIEW.ts before
 * assuming this Package activated live cross-chamber cinematic
 * transitions. It did not. This file makes the Director Engine
 * coordinated and callable through one chamber-bound session object; it
 * does NOT wire ACDE into any real page, layout, or navigation event.
 * No chamber currently calls anything in this file. See the Engineering
 * Review for why that boundary was held rather than crossed.
 */

import {
  beginTransition,
  transitionArrive,
  transitionComplete,
  setPhase,
  getPhase,
  advancePhase,
  summonDirector,
  withdrawDirector,
  beginJourney,
  advanceJourney,
  endJourney,
} from '../design-system';
import type {
  SceneTransition,
  CinematicPhase,
  CinematicJourney,
} from '../design-system';
import type { ChamberContext } from '../core/tongue';
import { getSovereignIdentity } from './orchestrator';
import type { ChamberScore } from './orchestrator';

/**
 * A chamber-bound coordination handle over ACDE's Director functions.
 * Holds no DOM state of its own — every method forwards directly to
 * ACDE, which itself only ever mutates whatever HTMLElement is passed
 * in. Constructing a session performs no side effect.
 */
export class DirectorSession {
  constructor(private readonly context: ChamberContext) {}

  /** This chamber's complete cinematic definition (arc, companion direction, default mode, transition in/out) — Constitutionally Undefined (null) for chambers ACDE never scored. */
  public get chamberScore(): ChamberScore | null {
    return getSovereignIdentity(this.context).chamberPacing;
  }

  /** Forwards to ACDE's beginTransition(container, thisChamber, toChamberId). */
  public beginTransition(container: HTMLElement | null, toChamberId: string): SceneTransition {
    return beginTransition(container, this.context, toChamberId);
  }

  /** Forwards to ACDE's transitionArrive(container). */
  public transitionArrive(container: HTMLElement | null): void {
    transitionArrive(container);
  }

  /** Forwards to ACDE's transitionComplete(container). */
  public transitionComplete(container: HTMLElement | null): void {
    transitionComplete(container);
  }

  /** Forwards to ACDE's setPhase(element, phase). */
  public setPhase(element: HTMLElement | null, phase: CinematicPhase): void {
    setPhase(element, phase);
  }

  /** Forwards to ACDE's getPhase(element). */
  public getPhase(element: HTMLElement | null): CinematicPhase | null {
    return getPhase(element);
  }

  /** Forwards to ACDE's advancePhase(element, enteredAt). */
  public advancePhase(element: HTMLElement | null, enteredAt: number): CinematicPhase | null {
    return advancePhase(element, enteredAt);
  }

  /** Forwards to ACDE's summonDirector(element). */
  public summonDirector(element: HTMLElement | null): void {
    summonDirector(element);
  }

  /** Forwards to ACDE's withdrawDirector(element). */
  public withdrawDirector(element: HTMLElement | null): void {
    withdrawDirector(element);
  }

  /** Forwards to ACDE's beginJourney(element, label). */
  public beginJourney(element: HTMLElement | null, label: string): CinematicJourney {
    return beginJourney(element, label);
  }

  /** Forwards to ACDE's advanceJourney(element, journey). */
  public advanceJourney(element: HTMLElement | null, journey: CinematicJourney): CinematicJourney {
    return advanceJourney(element, journey);
  }

  /** Forwards to ACDE's endJourney(element). */
  public endJourney(element: HTMLElement | null): void {
    endJourney(element);
  }
}

/** Creates a Director Session coordinated for one chamber context. */
export function createDirectorSession(context: ChamberContext): DirectorSession {
  return new DirectorSession(context);
}
