/**
 * AZMA OS — RAS AL AMR
 * PACKAGE IV — THE FIRST LIVING HEART
 * MISSION II — LIVING PRESENCE (WORK PACKAGE C: PRESENCE CONTEXT)
 * (Construction ID RAS-IV-M02)
 *
 * DECLARATIVE ONLY — no business logic, no execution logic, no runtime
 * automation. Defines the four context views Presence must hold: current,
 * previous, pending, and transition. This file is written first among
 * Mission II's artifacts because PRESENCE_IDENTITY.ts (Work Package A)
 * depends on it — Identity answers "what changed" by comparing Context's
 * current and previous views, rather than redefining its own comparison
 * shape.
 *
 * HONESTY CHECK performed before writing: RUNTIME_CORE_AWARENESS.ts (Mission
 * I) already defines a single, point-in-time RuntimeCoreAwareness snapshot.
 * This file does not restate that shape — it re-uses RuntimeCoreAwareness
 * as the *content* of each of the four context slots, and adds only what
 * Mission I never modeled: multiple, time-ordered views of that same
 * content (current vs. previous vs. pending vs. transition).
 */

import type { RuntimeCoreAwareness } from './RUNTIME_CORE_AWARENESS';

/**
 * The Chamber's execution context as it stands right now. Identical in
 * shape to RuntimeCoreAwareness (Mission I) — re-used by reference, not
 * redefined.
 */
export type PresenceCurrentContext = RuntimeCoreAwareness;

/**
 * The Chamber's execution context as it stood at the previous interaction.
 * Same shape as PresenceCurrentContext — Presence's genuinely new
 * contribution is holding TWO of these (current and previous) at once,
 * which Mission I's single-snapshot Awareness never did.
 */
export type PresencePreviousContext = RuntimeCoreAwareness;

/**
 * What is awaiting the Creator — not yet acted upon. Deliberately narrow:
 * only two constructs in this Chamber's certified chain represent something
 * genuinely "pending" a Creator response, and this type names only those
 * two, inventing no third.
 */
export interface PresencePendingContext {
  readonly recommendationAwaitingResponse: boolean;
  readonly exportConfirmationAwaitingResponse: boolean;
}

export const PRESENCE_PENDING_CONTEXT_GROUNDING = {
  recommendationAwaitingResponse: 'RUNTIME.ts, RecommendationOfferedSignal — a recommendation once offered awaits the Creator\'s accept/reject, per INTERFACE.ts\'s CreatorRecommendation.',
  exportConfirmationAwaitingResponse: 'RUNTIME.ts, EXPORT_CONFIRMATION_STATES — "unconfirmed" awaits the Creator\'s confirmation, per STORY.ts\'s export.',
  note: 'Both fields are observed here, neither is generated or decided.',
} as const;

/**
 * The fact that a transition is in flight — e.g. between two
 * RUNTIME_CORE_LIFECYCLE.ts stages, or between two SessionBeats. Presence
 * observes that a transition is occurring; it never authorizes or performs
 * one (that remains exclusively RUNTIME.ts's RUNTIME_INVARIANTS.creatorAuthorizesNarrative
 * and IMPLEMENTATION.ts's attemptBeatTransition, both unchanged by this
 * Mission).
 */
export interface PresenceTransitionContext {
  readonly transitionInProgress: boolean;
  readonly fromRuntimeStage: string | null;
  readonly toRuntimeStage: string | null;
}

export const PRESENCE_TRANSITION_CONTEXT_GROUNDING = {
  source: 'RUNTIME_CORE_LIFECYCLE.ts (Mission I) — read-only observation of an already-defined, already-certified transition table.',
} as const;

export interface PresenceExecutionContext {
  readonly current: PresenceCurrentContext;
  readonly previous: PresencePreviousContext | null;
  readonly pending: PresencePendingContext;
  readonly transition: PresenceTransitionContext;
}

export const PRESENCE_CONTEXT_DECLARATION = {
  redefinesRuntimeCoreAwareness: false,
  generatesRecommendations: false,
  authorizesTransitions: false,
  introducesNewConstitutionalAuthority: false,
  status: 'PACKAGE IV — MISSION II, WORK PACKAGE C, PRESENCE CONTEXT, complete. Reuses RuntimeCoreAwareness (Mission I) as content; adds only the current/previous/pending/transition time-ordering Mission I never modeled.',
} as const;

export const RAS_AL_AMR_PRESENCE_CONTEXT = {
  pendingGrounding: PRESENCE_PENDING_CONTEXT_GROUNDING,
  transitionGrounding: PRESENCE_TRANSITION_CONTEXT_GROUNDING,
  declaration: PRESENCE_CONTEXT_DECLARATION,
} as const;
