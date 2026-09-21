/**
 * AZMA OS — THE IMPERIAL AWARENESS ENGINE (IAE)
 * Type Definitions
 *
 * The full shape reflects the Council's ratified constitutional scope
 * (Creator identity, permissions, Chamber, Page, Workflow Stage,
 * Transition State, Goal State, Runtime Context). Only the fields with a
 * real, live data source today are populated by any caller — the rest
 * are honestly optional, not backed by invented logic, until a future
 * integration mission wires them to a real source (IXE/DirectorStage for
 * transitionState, Makman's Goal Awareness layer for goalState).
 *
 * `chamber` was wired on 2026-09-21 and is no longer reserved. `page`,
 * `transitionState` and `goalState` remain honestly unwired.
 */

import type { ChamberDestination } from '@/src/constitutional-navigation';

export interface AwarenessCreator {
  readonly authenticated: boolean;
  readonly role: 'creator' | 'founder' | null;
}

export type AwarenessWorkflowStage = 'gate' | 'subscribe' | 'chamber';

export type AwarenessChamberState = 'idle' | 'unauthorized' | 'payment-required' | 'error' | 'complete';

export interface AwarenessContext {
  readonly creator: AwarenessCreator;
  readonly workflowStage: AwarenessWorkflowStage;
  /** Relevant to the 'chamber' workflow stage only. */
  readonly chamberState?: AwarenessChamberState;
  /**
   * Which Chamber the Creator stands in, or null when the place is not a
   * Chamber — the Gate, /signup, the Foyer, the High Council.
   *
   * WIRED 2026-09-21. Its type was `string`, which would have accepted any
   * text a caller cared to invent; it is now the closed ChamberDestination,
   * so the compiler refuses a Chamber that does not exist. Resolved through
   * resolve-chamber.ts, which asks the sovereign registry rather than
   * trusting a pathname.
   *
   * Optional still, and deliberately: the three existing callers pass no
   * Chamber, and their behaviour is unchanged by this field's arrival.
   */
  readonly chamber?: ChamberDestination | null;
  /** Reserved for future integration — not yet wired to a real source. */
  readonly page?: string;
  /** Reserved for future integration — not yet wired to IXE/DirectorStage. */
  readonly transitionState?: string;
  /** Reserved for future integration — not yet wired to Makman's Goal Awareness layer. */
  readonly goalState?: unknown;
}
