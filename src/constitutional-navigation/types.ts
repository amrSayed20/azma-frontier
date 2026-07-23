/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * Type Definitions
 *
 * Authority: Package IV, "Living Experience Foundation" — Architectural
 * Decision following the Investigation stage's F1/F6 findings.
 */

import type { ChamberContext } from '../core/tongue';

/** A real Chamber a Creator can be navigated to — every ChamberContext except the non-chamber 'universal' fallback. */
export type ChamberDestination = Exclude<ChamberContext, 'universal'>;

export interface ChamberDirectoryEntry {
  readonly chamber: ChamberDestination;
  readonly pathname: string;
  /** Inherited verbatim from src/core/tongue/constitution.ts's CONTEXT_ROLES — never redefined here. */
  readonly role: string;
}

export interface ConstitutionalNavigationCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
