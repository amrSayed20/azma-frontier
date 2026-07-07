/**
 * AZMA OS — Tongue Constitution (ATC) V1.1
 * Article XIV — The Tongue Has Intention
 * Article XVI — Outcome Before Response
 *
 * Before producing any sentence, the Tongue must first determine:
 * "What is the desired outcome for the Citizen?"
 *
 * Not: "What is the correct answer?"
 * Every response begins with intention.
 * Every sentence exists to move the Citizen toward a better outcome.
 *
 * The Tongue never speaks merely to respond. It speaks to transform.
 *
 * Article XVI: Every interaction is silently evaluated.
 * The Tongue asks: "Did the Citizen become closer to the intended goal?"
 * The Empire measures progress. Never verbosity.
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import type { ChamberContext, TongueIntent } from './constitution';
import type { CitizenProfile } from './memory';

// ── Article XIV — Outcome Types ───────────────────────────────────────────
// The seven constitutional outcome categories.
// Every intention resolves to one of these.

export type CitizenOutcomeType =
  | 'clarity'      // citizen needs to understand something
  | 'decision'     // citizen needs to make a choice
  | 'creation'     // citizen needs to produce something
  | 'validation'   // citizen needs confirmation that they are on the right track
  | 'exploration'  // citizen is discovering possibilities, not yet committed
  | 'resolution'   // citizen needs a specific conflict or problem resolved
  | 'momentum';    // citizen has completed a phase and needs the next step

// ── Tongue Intention ──────────────────────────────────────────────────────

export interface TongueIntention {
  outcomeType:  CitizenOutcomeType;
  desiredState: string;    // what the Citizen's situation should look like after this response
  currentState: string;    // what the Citizen's situation looks like now (constitutional, not content-specific)
  gap:          string;    // what separates current from desired
  movementGoal: string;    // what this specific response must move the Citizen toward
}

// ── Chamber Default Outcome Preferences ──────────────────────────────────
// Each chamber has a constitutional outcome affinity — not a rule, a tendency.
// The linguistic signals may override this.

const CHAMBER_OUTCOME_AFFINITY: Record<ChamberContext, CitizenOutcomeType> = {
  'sovereign-vault-palace': 'validation',   // citizen is reviewing their creative work
  'hujjah-al-damighah':     'decision',     // citizen is investigating toward a verdict
  'qiyamah-chamber':        'decision',     // citizen is reaching judgment
  'ras-amr':                'creation',     // citizen is producing governance artifacts
  'makman-al-ghayah':       'exploration',  // citizen is strategizing possibilities
  'universal':              'clarity',      // no context — default to understanding
} as const;

// ── Linguistic Signal Detection ───────────────────────────────────────────
// The Tongue reads behavioral signals from the citizen's expression.
// This is constitutional pattern recognition — not AI inference.
// The Core refines this; the Constitution provides the baseline.

const OUTCOME_SIGNALS: Record<CitizenOutcomeType, string[]> = {
  clarity:     ['what is', 'explain', 'what does', 'how does', 'define', 'meaning', 'understand', 'what are', 'tell me about'],
  decision:    ['should i', 'which', 'choose', 'decide', 'option', 'better', 'compare', 'between', 'or should'],
  creation:    ['write', 'create', 'make', 'build', 'design', 'draft', 'compose', 'generate', 'produce', 'prepare'],
  validation:  ['is this', 'check', 'review', 'does this', 'correct', 'right', 'good enough', 'look at this', 'does it'],
  exploration: ['what if', 'could', 'possible', 'alternative', 'explore', 'ideas', 'options', 'possibilities', 'imagine'],
  resolution:  ['problem', 'issue', 'fix', 'solve', 'not working', 'error', 'wrong', 'help with', 'stuck', 'failed'],
  momentum:    ['next', 'continue', 'what now', 'next step', 'after this', 'then what', 'proceed', 'what should i do'],
} as const;

function detectOutcomeType(
  raw:     string,
  context: ChamberContext,
): CitizenOutcomeType {
  const lower = raw.toLowerCase();

  // Score each outcome type by signal matches
  const scores: Partial<Record<CitizenOutcomeType, number>> = {};
  for (const [outcome, signals] of Object.entries(OUTCOME_SIGNALS) as [CitizenOutcomeType, string[]][]) {
    scores[outcome] = signals.filter(s => lower.includes(s)).length;
  }

  // Find the highest-scoring outcome
  let bestOutcome: CitizenOutcomeType = CHAMBER_OUTCOME_AFFINITY[context];
  let bestScore = 0;

  for (const [outcome, score] of Object.entries(scores) as [CitizenOutcomeType, number][]) {
    if (score > bestScore) {
      bestScore   = score;
      bestOutcome = outcome;
    }
  }

  return bestOutcome;
}

// ── Constitutional Intention Templates ────────────────────────────────────
// These are the constitutional descriptions of each outcome state.
// The Core fills in the specific content; the Constitution provides the shape.

const DESIRED_STATE_TEMPLATES: Record<CitizenOutcomeType, string> = {
  clarity:     'citizen holds complete understanding and can move forward with confidence',
  decision:    'citizen has made a clear, informed choice and is ready to act on it',
  creation:    'citizen has produced an artifact that exceeds their original vision',
  validation:  'citizen is certain they are on the right path and understands why',
  exploration: 'citizen has discovered a possibility they had not considered — and it is stronger than their original direction',
  resolution:  'the specific obstacle has been removed and the path forward is unobstructed',
  momentum:    'citizen knows precisely what the next meaningful step is and is ready to take it',
};

const GAP_TEMPLATES: Record<CitizenOutcomeType, string> = {
  clarity:     'the concept or relationship has not yet been made visible',
  decision:    'the criteria for the right choice are not yet clear',
  creation:    'the gap between vision and execution has not yet been bridged',
  validation:  'the citizen does not yet have confirmation that their direction is sound',
  exploration: 'the stronger possibilities have not yet been revealed',
  resolution:  'the cause and resolution of the obstacle are not yet identified',
  momentum:    'the next step has not yet crystallized from the completed phase',
};

const MOVEMENT_GOAL_TEMPLATES: Record<CitizenOutcomeType, string> = {
  clarity:     'this response makes the concept visible, concrete, and actionable',
  decision:    'this response clarifies the deciding criteria and removes ambiguity',
  creation:    'this response advances the artifact from its current state toward excellence',
  validation:  'this response confirms what is sound, identifies what can be stronger, and does both quietly',
  exploration: 'this response opens a direction the citizen had not yet considered',
  resolution:  'this response removes the specific obstacle and restores forward momentum',
  momentum:    'this response delivers the next concrete step with enough clarity to act immediately',
};

// ── Article XIV — Primary Functions ──────────────────────────────────────

/**
 * Determines the Tongue's intention before producing any response.
 * Article XIV: Every response begins with intention.
 */
export function determineIntention(
  intent:  TongueIntent,
  profile: CitizenProfile,
): TongueIntention {
  const outcomeType = detectOutcomeType(intent.raw, intent.context);

  // Depth preference shifts the desired state slightly
  const depthSuffix =
    profile.preferredDepth === 'deep'    ? ' — at depth, not at surface' :
    profile.preferredDepth === 'surface' ? ' — clearly and briefly' : '';

  return {
    outcomeType,
    desiredState:  DESIRED_STATE_TEMPLATES[outcomeType] + depthSuffix,
    currentState:  'citizen has expressed intent; understanding has been assessed',
    gap:           GAP_TEMPLATES[outcomeType],
    movementGoal:  MOVEMENT_GOAL_TEMPLATES[outcomeType],
  };
}

// ── Article XVI — Outcome Assessment ─────────────────────────────────────
// The Empire measures progress. Never verbosity.

export type OutcomeSignal =
  | 'continued'    // citizen continued engaging — likely moving forward
  | 'expanded'     // citizen asked for more — definitely moving forward
  | 'interrupted'  // citizen cut the response — may need adjustment
  | 'silent'       // citizen was silent — processing or confused
  | 'dismissed';   // citizen moved away — not moving toward the goal

export interface OutcomeAssessment {
  movedCloser:    boolean;
  movement:       number;         // -1.0 to 1.0 where 1 = significant progress
  signal:         'advancing' | 'static' | 'retreating';
  nextIntention:  TongueIntention | null;  // updated intention for next response
}

const MOVEMENT_SCORES: Record<OutcomeSignal, number> = {
  expanded:    1.0,
  continued:   0.6,
  silent:      0.1,   // ambiguous — lean slightly positive (processing)
  interrupted: -0.2,  // ambiguous — may need less, not necessarily wrong
  dismissed:   -1.0,
} as const;

/**
 * Evaluates whether the Citizen moved closer to the intended goal.
 * Article XVI: The Empire measures progress. Never verbosity.
 */
export function assessOutcome(
  intention:     TongueIntention,
  citizenSignal: OutcomeSignal,
): OutcomeAssessment {
  const score      = MOVEMENT_SCORES[citizenSignal];
  const movedCloser = score > 0;

  const signal: 'advancing' | 'static' | 'retreating' =
    score > 0.4  ? 'advancing'  :
    score < -0.3 ? 'retreating' : 'static';

  // If retreating, the intention shifts to understand why
  const nextIntention: TongueIntention | null =
    citizenSignal === 'dismissed' || citizenSignal === 'interrupted'
      ? {
          outcomeType:  'clarity',
          desiredState: 'citizen and the Tongue are aligned on what the citizen actually needs',
          currentState: 'the previous response did not move the citizen forward',
          gap:          'the true intent behind the citizen\'s expression is not yet understood',
          movementGoal: 'this response discovers what would actually help — through one question, not assumptions',
        }
      : null;

  return { movedCloser, movement: score, signal, nextIntention };
}

/**
 * Returns an updated intention based on outcome assessment.
 * If the citizen is advancing, the intention deepens toward the same goal.
 * If retreating, the intention resets to understanding.
 */
export function updateIntentionFromOutcome(
  current:    TongueIntention,
  assessment: OutcomeAssessment,
): TongueIntention {
  if (assessment.nextIntention) return assessment.nextIntention;

  if (assessment.signal === 'advancing') {
    // Advance the intention — the citizen is closer, so the gap is smaller
    return {
      ...current,
      currentState: 'citizen has moved forward — previous gap has narrowed',
      gap:          `remaining gap: ${current.gap}`,
      movementGoal: `continue: ${current.movementGoal}`,
    };
  }

  return current;
}
