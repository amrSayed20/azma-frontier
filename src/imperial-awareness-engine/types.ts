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
 * transitionState, Makman's Goal Awareness layer for goalState, real
 * per-Chamber routing for chamber/page).
 */

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
  /** Reserved for future integration — not yet wired to a real source. */
  readonly chamber?: string;
  /** Reserved for future integration — not yet wired to a real source. */
  readonly page?: string;
  /** Reserved for future integration — not yet wired to IXE/DirectorStage. */
  readonly transitionState?: string;
  /** Reserved for future integration — not yet wired to Makman's Goal Awareness layer. */
  readonly goalState?: unknown;
}
