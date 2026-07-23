/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION (CONSTITUTIONAL ACTION)
 * Construction Campaign — Type Definitions
 *
 * Authority: "The Constitutional Construction Campaign," THE
 * CONSTITUTIONAL EXECUTION ("The Birth of Constitutional Action").
 *
 * WHAT "CONSTITUTIONAL ACTION" ACTUALLY MEANS HERE, disclosed rather
 * than invented: no prior Constitutional Package anywhere in this
 * campaign has ever authorized a concrete external capability for this
 * layer to invoke — no AI-provider integration, no organ mutation, no
 * notification, no UI. This Campaign's own Out of Scope explicitly
 * forbids "Policy changes" and "Constitutional reasoning," and its
 * Constitutional Limits forbid ever exercising judgment. Given that, the
 * only faithful, non-inventive interpretation of "execute faithfully"
 * is: produce ONE uniform, judgment-free record — a receipt — that an
 * already-approved Decision has been carried through to completion.
 * There is exactly one ConstitutionalActionKind ('faithful-record'),
 * applied identically to every approved Decision regardless of organ or
 * content, precisely because having more than one kind, or branching on
 * content to choose between kinds, would itself be an act of judgment —
 * forbidden here by name ("shall never exercise Constitutional
 * Judgment"). This module never calls emitSignal, circulateFromClient,
 * awaken, rest, recordSignalSeen, or any organ's own mutating function —
 * "faithful execution" is recording, not acting upon the world.
 */

import type { ConstitutionalDecision } from '../constitutional-decision';

export type ConstitutionalActionKind = 'faithful-record';

export interface ConstitutionalAction {
  readonly actionKind: ConstitutionalActionKind;
  readonly description: string;
}

export interface ConstitutionalExecution {
  readonly executionId: string;
  readonly organId: string;
  readonly sourceDecisionId: string;
  readonly action: ConstitutionalAction;
  readonly executedAt: string;
}

export interface ExecutionResult {
  readonly executionId: string;
  readonly outcome: 'completed';
  readonly recordedAt: string;
  readonly summary: string;
}

export interface ExecutionRejection {
  readonly decisionId: string;
  readonly reason: string;
}

export interface ConstitutionalExecutionCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}

export type { ConstitutionalDecision };
