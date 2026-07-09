/**
 * AZMA OS — RAS AL AMR
 * PACKAGE IV — THE FIRST LIVING HEART
 * MISSION II — LIVING PRESENCE (WORK PACKAGE A: PRESENCE IDENTITY)
 * (Construction ID RAS-IV-M02)
 *
 * DECLARATIVE ONLY. Answers, by reference to PRESENCE_CONTEXT.ts (Work
 * Package C, this Mission) and RUNTIME_CORE_IDENTITY.ts (Mission I), the
 * four questions Work Package A poses: where execution stands, what
 * remains unfinished, what awaits the Creator, and what changed since the
 * previous interaction. This file computes none of these itself — it names
 * where each answer already lives.
 */

import type { RuntimeCoreIdentity } from './RUNTIME_CORE_IDENTITY';
import type { PresenceExecutionContext } from './PRESENCE_CONTEXT';

export interface PresenceIdentity {
  readonly runtimeIdentity: RuntimeCoreIdentity;
  readonly executionContext: PresenceExecutionContext;
}

export interface RasAlAmrPresenceIdentityQuestion {
  readonly question: string;
  readonly answeredBy: string;
  readonly constitutionalSource: string;
}

export const PRESENCE_IDENTITY_QUESTIONS: readonly RasAlAmrPresenceIdentityQuestion[] = [
  {
    question: 'Where does execution currently stand?',
    answeredBy: 'PresenceExecutionContext.current (= RuntimeCoreAwareness) — already carries currentRuntimeStage, currentGoalState, and nextStep.',
    constitutionalSource: 'RUNTIME_CORE_AWARENESS.ts, RUNTIME_CORE_IDENTITY.ts (Mission I).',
  },
  {
    question: 'What remains unfinished?',
    answeredBy: 'PresenceExecutionContext.current.goal.state, compared against PACKAGE_III_EXECUTION_GOAL_MODEL.ts\'s three terminal states (Achieved/Cancelled/Archived) — unfinished means the Goal is in any of the four non-terminal states (Declared/Prepared/Approved/Active). No new state is invented; "unfinished" is a read, not a new field.',
    constitutionalSource: 'PACKAGE_III_EXECUTION_GOAL_MODEL.ts, GOAL_CONSTITUTIONAL_STATES.',
  },
  {
    question: 'What is awaiting the Creator?',
    answeredBy: 'PresenceExecutionContext.pending (recommendationAwaitingResponse, exportConfirmationAwaitingResponse).',
    constitutionalSource: 'PRESENCE_CONTEXT.ts, PresencePendingContext (this Mission, Work Package C).',
  },
  {
    question: 'What has changed since the previous interaction?',
    answeredBy: 'A structural comparison between PresenceExecutionContext.current and PresenceExecutionContext.previous — both already exist as the same RuntimeCoreAwareness shape, so "what changed" is a field-by-field difference between two already-typed snapshots, not a new computed concept requiring new authority.',
    constitutionalSource: 'PRESENCE_CONTEXT.ts, PresenceCurrentContext / PresencePreviousContext.',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// HONESTY CHECK — no new mechanism, only cross-reference
// ═══════════════════════════════════════════════════════════════════════════

export const PRESENCE_IDENTITY_HONESTY_CHECK = {
  performed: true,
  finding: 'All four questions Work Package A poses are answerable entirely from constructs Mission I and Work Package C (this Mission) already define. This file introduces zero new state fields of its own — PresenceIdentity is a composition of two already-typed shapes (RuntimeCoreIdentity, PresenceExecutionContext), not a new construct with new content.',
} as const;

export const PRESENCE_IDENTITY_DECLARATION = {
  newStateFieldsIntroduced: 0,
  computesAnswers: false,
  redefinesRuntimeCoreIdentity: false,
  status: 'PACKAGE IV — MISSION II, WORK PACKAGE A, PRESENCE IDENTITY, complete. A composition over Mission I\'s Identity and this Mission\'s own Context — no new state.',
} as const;

export const RAS_AL_AMR_PRESENCE_IDENTITY = {
  questions: PRESENCE_IDENTITY_QUESTIONS,
  honestyCheck: PRESENCE_IDENTITY_HONESTY_CHECK,
  declaration: PRESENCE_IDENTITY_DECLARATION,
} as const;
