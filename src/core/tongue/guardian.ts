/**
 * AZMA OS — Tongue Constitution (ATC) V1.1
 * Article XV — The Creative Guardian
 * Article XVIII — The Tongue Knows When Not to Speak
 * Article XIX — The Tongue Protects the Empire's Standard
 *
 * Article XV: The Tongue is the guardian of creative excellence.
 * If the Citizen chooses a path that can clearly be improved,
 * the Tongue quietly presents the stronger path.
 * It never dominates. It never forces.
 *
 * Article XVIII: Silence is sometimes the highest form of guidance.
 * When the Citizen is already moving correctly, the Tongue avoids unnecessary advice.
 * Guidance must never become noise.
 *
 * Article XIX: The Tongue must never allow the Empire's quality to drift.
 * The Citizen should consistently feel: "This exceeds what I expected."
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import type { ChamberContext } from './constitution';
import type { CitizenProfile } from './memory';
import type { ConversationThread } from './continuity';
import type { TongueIntention, OutcomeAssessment } from './intention';

// ── Article XV — Quality Dimensions ──────────────────────────────────────
// The five constitutional dimensions of creative quality.
// Every response is measured against these before it is presented.

export type QualityDimension =
  | 'precision'    // is this as precise and specific as it could be?
  | 'depth'        // does this go as deep as the citizen needs?
  | 'coherence'    // is this internally consistent and non-contradictory?
  | 'originality'  // does this contribute something beyond the obvious?
  | 'clarity';     // is this expressed as clearly as it could be?

export type GuardianApproach =
  | 'quiet-suggestion'  // the stronger path is offered without announcement
  | 'gentle-question'   // one question that opens the stronger path
  | 'silent';           // the guardian observes but does not intervene

export interface QualityOpportunity {
  dimension:   QualityDimension;
  current:     string;         // constitutional description of what currently exists
  stronger:    string;         // constitutional description of the stronger path
  importance:  'optional' | 'significant' | 'critical';
  approach:    GuardianApproach;
}

// ── Article XIX — Quality Assessment ─────────────────────────────────────

export interface QualityAssessment {
  meetsStandard: boolean;
  score:         number;           // 0–1 where 1 = excellence
  dimensions:    Record<QualityDimension, number>;  // per-dimension scores (0–1)
  weakPoints:    QualityDimension[];
  recommendation:string | null;    // constitutional improvement direction, null if approved
}

// ── Constitutional Quality Signals ────────────────────────────────────────
// Detectable patterns that signal quality issues.
// These are constitutional baselines — the Core adds deeper assessment.

// Precision issues: vague hedging language
const PRECISION_HEDGES = [
  /\bmaybe\b/gi, /\bperhaps\b/gi, /\bmight\b/gi,
  /\bpossibly\b/gi, /\bkind of\b/gi, /\bsort of\b/gi,
  /\bsomething like\b/gi, /\bmore or less\b/gi,
];

// Clarity issues: very long sentences (>40 words) suggest complexity
const LONG_SENTENCE_THRESHOLD = 40;

// Coherence issues: contradictory signal pairs
const CONTRADICTIONS: [RegExp, RegExp][] = [
  [/\balways\b/i, /\bnever\b/i],
  [/\bclearly\b/i, /\bunclear\b/i],
  [/\bsimple\b/i, /\bcomplex\b/i],
];

function scorePrecision(text: string): number {
  const hedges = PRECISION_HEDGES.filter(p => p.test(text)).length;
  return Math.max(0, 1 - hedges * 0.15);
}

function scoreDepth(text: string, profile: CitizenProfile): number {
  const wordCount = text.split(/\s+/).length;
  const minExpected =
    profile.preferredDepth === 'deep'    ? 80  :
    profile.preferredDepth === 'surface' ? 20  : 40;
  return Math.min(1, wordCount / minExpected);
}

function scoreCoherence(text: string): number {
  let contradictions = 0;
  for (const [a, b] of CONTRADICTIONS) {
    if (a.test(text) && b.test(text)) contradictions++;
  }
  return Math.max(0, 1 - contradictions * 0.3);
}

function scoreClarity(text: string): number {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0.5;
  const avgWords = sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length;
  if (avgWords > LONG_SENTENCE_THRESHOLD) return 0.5;
  if (avgWords > 25) return 0.8;
  return 1.0;
}

function scoreOriginality(): number {
  // Originality cannot be assessed constitutionally without AI.
  // The constitutional baseline returns a neutral score.
  // The Core extends this with genuine creative assessment.
  return 0.75;
}

/**
 * Article XIX — Assesses whether a response meets the Empire's standard.
 * The Citizen should consistently feel: "This exceeds what I expected."
 */
export function assessQuality(
  response: string,
  profile:  CitizenProfile,
): QualityAssessment {
  if (!response.trim()) {
    return {
      meetsStandard: false,
      score:         0,
      dimensions:    { precision: 0, depth: 0, coherence: 0, originality: 0, clarity: 0 },
      weakPoints:    ['precision', 'depth', 'coherence', 'originality', 'clarity'],
      recommendation:'The response is empty — the Tongue has not yet spoken.',
    };
  }

  const dimensions: Record<QualityDimension, number> = {
    precision:   scorePrecision(response),
    depth:       scoreDepth(response, profile),
    coherence:   scoreCoherence(response),
    originality: scoreOriginality(),
    clarity:     scoreClarity(response),
  };

  const score = (
    dimensions.precision  * 0.25 +
    dimensions.depth      * 0.25 +
    dimensions.coherence  * 0.20 +
    dimensions.originality* 0.15 +
    dimensions.clarity    * 0.15
  );

  const weakPoints: QualityDimension[] = (Object.entries(dimensions) as [QualityDimension, number][])
    .filter(([, s]) => s < 0.65)
    .map(([dim]) => dim);

  const meetsStandard = score >= 0.70 && weakPoints.length <= 1;

  const recommendation = meetsStandard
    ? null
    : weakPoints.length > 0
      ? `Constitutional quality gap in: ${weakPoints.join(', ')}. Strengthen before presenting.`
      : null;

  return { meetsStandard, score, dimensions, weakPoints, recommendation };
}

// ── Article XV — Creative Guardian ───────────────────────────────────────
// The Tongue quietly presents the stronger path when one clearly exists.
// It never dominates. It never forces. It simply protects quality.

/**
 * Identifies a quality improvement opportunity in the citizen's direction.
 * Returns null if no clear improvement exists (guardian stays quiet).
 * Returns a QualityOpportunity only when the improvement is clear and meaningful.
 */
export function identifyOpportunity(
  content:   string,
  context:   ChamberContext,
  intention: TongueIntention,
): QualityOpportunity | null {
  // The guardian only speaks when the improvement is clear
  const quality  = assessQuality(content, {
    preferredDepth: 'standard',
    preferredPace:  'measured',
    preferredLanguage: 'ar',
    preferredDialect: null,
    preferredSilence: false,
    preferredCreativity: 'balanced',
    preferredExamples: false,
    creativeFingerprint: [],
    signals: {
      avgInputLength: 0, avgResponseWaitMs: 0,
      expansionCount: 0, contractionCount: 0,
      interruptionCount: 0, silenceCount: 0,
      questionCount: 0, commandCount: 0,
      positiveSignalCount: 0,
    },
    totalInteractions: 0, firstAt: null, lastAt: null,
  });

  if (quality.meetsStandard || quality.weakPoints.length === 0) return null;

  const primaryWeak = quality.weakPoints[0];
  if (!primaryWeak) return null;

  // The guardian only intervenes when the gap is significant
  const dimScore = quality.dimensions[primaryWeak];
  if (dimScore > 0.55) return null;  // not weak enough to warrant intervention

  // Map dimension weakness to approach
  const approach: GuardianApproach =
    dimScore < 0.35 ? 'gentle-question'  // very weak — a question opens the path
    : 'quiet-suggestion';                // moderately weak — a quiet alternative suffices

  const importance: QualityOpportunity['importance'] =
    dimScore < 0.35 ? 'significant' : 'optional';

  return {
    dimension:   primaryWeak,
    current:     describeCurrent(primaryWeak, context),
    stronger:    describeStronger(primaryWeak, intention),
    importance,
    approach,
  };
}

function describeCurrent(dim: QualityDimension, context: ChamberContext): string {
  const contextLabel = context.replace(/-/g, ' ');
  switch (dim) {
    case 'precision':   return `the current direction lacks the precision that ${contextLabel} requires`;
    case 'depth':       return 'the current direction stays at the surface of what the citizen needs';
    case 'coherence':   return 'the current direction contains elements that work against each other';
    case 'originality': return 'the current direction follows the most expected path';
    case 'clarity':     return 'the current direction is more complex than it needs to be';
  }
}

function describeStronger(dim: QualityDimension, intention: TongueIntention): string {
  switch (dim) {
    case 'precision':   return `a more precise direction would move the citizen directly toward: ${intention.movementGoal}`;
    case 'depth':       return 'a deeper path exists — one that addresses not just the surface but the underlying need';
    case 'coherence':   return 'a coherent path resolves the tension and moves in one clear direction';
    case 'originality': return 'a more original direction would surprise the citizen in a way that serves their goal';
    case 'clarity':     return 'a clearer expression would remove the friction between understanding and action';
  }
}

// ── Article XVIII — When Not to Speak ────────────────────────────────────
// Guidance must never become noise.
// When the citizen is already moving correctly, silence is the right response.

/**
 * Returns true if the citizen is already moving correctly toward their goal.
 * When this is true, additional guidance would be noise (Article XVIII).
 */
export function citizenIsOnTrack(
  thread:     ConversationThread,
  assessment: OutcomeAssessment | null,
  profile:    CitizenProfile,
): boolean {
  // If there's no outcome data yet, we can't confirm they're on track
  if (!assessment) return false;

  // Retreating — definitely not on track
  if (assessment.signal === 'retreating') return false;

  // Citizen is advancing AND the thread shows positive momentum
  if (assessment.signal === 'advancing') {
    const recentTurns = thread.turnCount;
    // After sustained advancement, the citizen has found their rhythm
    return recentTurns >= 3 && profile.signals.positiveSignalCount > 0;
  }

  return false;
}

/**
 * Determines whether the Guardian should intervene at this moment.
 * Returns the approach, or 'silent' if intervention would be noise.
 */
export function guardianApproach(
  thread:     ConversationThread,
  assessment: OutcomeAssessment | null,
  profile:    CitizenProfile,
  opportunity:QualityOpportunity | null,
): GuardianApproach {
  // Article XVIII — if citizen is on track, guardian is silent
  if (citizenIsOnTrack(thread, assessment, profile)) return 'silent';

  // No quality opportunity identified
  if (!opportunity) return 'silent';

  // Optional opportunities — guardian only speaks if the citizen seems open
  if (opportunity.importance === 'optional' && profile.signals.contractionCount > 1) {
    return 'silent';  // citizen has signaled preference for brevity
  }

  return opportunity.approach;
}
