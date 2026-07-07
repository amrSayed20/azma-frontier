/**
 * AZMA OS — Tongue Constitution (ATC) V1.1
 * Article XX — The Tongue Never Ends the Journey
 *
 * No conversation ends with an answer.
 * Every conversation either:
 *   opens a better direction,
 *   reveals a stronger possibility,
 *   or prepares the next meaningful step.
 *
 * The Empire always leaves the Citizen with momentum.
 * Never with emptiness.
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import type { ChamberContext } from './constitution';
import type { TongueIntention, CitizenOutcomeType } from './intention';
import {
  type MomentumPoint,
  type MomentumType,
  type ConversationThread,
  addMomentumToThread,
  getActiveMomentumForContext,
  consumeMomentum,
} from './continuity';

// ── Re-export types from continuity for consumers ─────────────────────────
export type { MomentumType, MomentumPoint };

// ── Momentum Configuration ────────────────────────────────────────────────
// How long each type of momentum remains valid.

const MOMENTUM_TTL: Record<MomentumType, number | null> = {
  'better-direction':     2 * 60 * 60 * 1000,   // 2 hours
  'stronger-possibility': 1 * 60 * 60 * 1000,   // 1 hour
  'next-step':            30 * 60 * 1000,         // 30 minutes — next steps are urgent
} as const;

// ── Momentum Templates ────────────────────────────────────────────────────
// The constitutional descriptions of each momentum type per outcome.
// The Core fills in the specific content. The Constitution provides the shape.

const DIRECTION_TEMPLATES: Record<CitizenOutcomeType, string> = {
  clarity:     'a related concept that will deepen the understanding just established',
  decision:    'a factor not yet considered that could change the decision',
  creation:    'a creative direction not yet explored that could elevate the artifact',
  validation:  'an aspect not yet validated that deserves the same scrutiny',
  exploration: 'a possibility further along the explored direction that becomes more interesting',
  resolution:  'the next obstacle that will appear after the current one is resolved',
  momentum:    'the step after the next step — so the citizen is never caught without direction',
};

const POSSIBILITY_TEMPLATES: Record<CitizenOutcomeType, string> = {
  clarity:     'a simpler explanation than the one given — if the citizen asks again',
  decision:    'a third option not yet surfaced — stronger than either presented',
  creation:    'a structural change that would improve what is already created',
  validation:  'a benchmark that would make the validation definitive rather than approximate',
  exploration: 'a combination of explored directions that produces something stronger',
  resolution:  'a root cause beneath the surface problem — resolving it prevents recurrence',
  momentum:    'an approach to the next step that is faster than the obvious path',
};

const NEXT_STEP_TEMPLATES: Record<CitizenOutcomeType, string> = {
  clarity:     'applying the understanding to a specific, concrete situation',
  decision:    'gathering the final piece of information that makes the decision possible',
  creation:    'the first concrete action that moves the artifact from concept to existence',
  validation:  'testing the validated direction against one real condition',
  exploration: 'committing to the strongest explored direction and beginning',
  resolution:  'verifying that the resolution holds — one confirmation step',
  momentum:    'beginning the next step immediately, while the previous momentum is still active',
};

// ── Article XX — Primary Functions ───────────────────────────────────────

function generateId(): string {
  return `momentum-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

/**
 * Generates the appropriate momentum point for the end of a conversation exchange.
 * Article XX: every conversation either opens a direction, reveals a possibility,
 * or prepares the next step.
 */
export function generateMomentum(
  intention:    TongueIntention,
  thread:       ConversationThread,
  context:      ChamberContext,
): MomentumPoint {
  // Determine the most appropriate momentum type based on the thread state
  const type = selectMomentumType(intention, thread);
  const ttl  = MOMENTUM_TTL[type];

  const description = buildDescription(type, intention);

  const point: MomentumPoint = {
    id:          generateId(),
    type,
    description,
    chamberId:   context,
    createdAt:   Date.now(),
    expiresAt:   ttl !== null ? Date.now() + ttl : null,
    consumed:    false,
  };

  // Persist to the thread immediately
  addMomentumToThread(point);

  return point;
}

function selectMomentumType(
  intention: TongueIntention,
  thread:    ConversationThread,
): MomentumType {
  // Early in the journey: open better directions
  if (thread.turnCount < 3) return 'better-direction';

  // In the middle: reveal stronger possibilities
  if (thread.turnCount < 7) return 'stronger-possibility';

  // Later in the journey: focus on next concrete steps
  return 'next-step';
}

function buildDescription(type: MomentumType, intention: TongueIntention): string {
  const { outcomeType } = intention;
  switch (type) {
    case 'better-direction':    return DIRECTION_TEMPLATES[outcomeType];
    case 'stronger-possibility':return POSSIBILITY_TEMPLATES[outcomeType];
    case 'next-step':           return NEXT_STEP_TEMPLATES[outcomeType];
  }
}

// ── Momentum Queries ──────────────────────────────────────────────────────

/**
 * Returns true if the thread has unconsumed momentum points.
 * Article XX: the Tongue never ends the journey.
 */
export function hasPendingMomentum(thread: ConversationThread): boolean {
  const now = Date.now();
  return thread.momentumPoints.some(
    m => !m.consumed && (m.expiresAt === null || m.expiresAt > now),
  );
}

/**
 * Returns the most relevant momentum point for the current context.
 * Prefers momentum from the current chamber; falls back to any active momentum.
 */
export function getRelevantMomentum(
  context:    ChamberContext,
): MomentumPoint | null {
  // First: momentum specific to this chamber
  const chamberMomentum = getActiveMomentumForContext(context);
  if (chamberMomentum.length > 0) return chamberMomentum[0] ?? null;

  return null;
}

/**
 * Marks a momentum point as consumed.
 * Called when the citizen has acted on it or it has been presented.
 */
export function consumeMomentumPoint(id: string): void {
  consumeMomentum(id);
}

/**
 * Returns the constitutional narrative of a momentum point for the Core.
 * The Core reads this to understand what kind of momentum to generate content for.
 * This description is never shown verbatim to the citizen.
 */
export function readMomentumIntent(point: MomentumPoint): {
  type:    MomentumType;
  frame:   string;
  urgency: 'immediate' | 'available' | 'ambient';
} {
  const now    = Date.now();
  const expiry = point.expiresAt;

  let urgency: 'immediate' | 'available' | 'ambient';
  if (expiry === null) {
    urgency = 'ambient';
  } else {
    const remainingMs = expiry - now;
    urgency = remainingMs < 10 * 60 * 1000 ? 'immediate' : 'available';
  }

  return {
    type:    point.type,
    frame:   point.description,
    urgency,
  };
}
