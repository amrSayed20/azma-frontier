/**
 * AZMA OS — Tongue Constitution (ATC) V2.0
 * Article XXV — The Imperial Conscience
 * Article XXII — The Tongue Protects the Empire's Dignity
 * Article XXIV — The Tongue Evolves Without Losing Its Identity
 *
 * Article XXV: The Tongue has not merely the right to intervene when quality
 * falls below the Empire's standard — it has a constitutional responsibility.
 * Excellence is not optional. The Imperial Conscience is always active.
 * It never intervenes on the same dimension twice in a session.
 *
 * Article XXII: Before any response leaves the Tongue, it must pass three gates:
 * Is it truthful? Is it useful? Is it worthy of the Empire?
 * If any gate fails — the response must not be delivered.
 *
 * Article XXIV: The Tongue's identity is constitutionally immutable.
 * Providers change. Models change. Infrastructure changes.
 * The Tongue does not. AZMA is AZMA — above all technology beneath it.
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import { validateResponse, type CommunicationMode } from './constitution';
import type { CitizenProfile } from './memory';
import type { QualityAssessment, QualityDimension, GuardianApproach } from './guardian';
import type { FlowState } from './creator';

// ── Article XXII — Dignity Gates ──────────────────────────────────────────

export interface DignityGate {
  truthful:     boolean;
  useful:       boolean;
  worthy:       boolean;
  approved:     boolean;
  blockingGate: 'truthful' | 'useful' | 'worthy' | null;
}

// Constitutional truthfulness: absolute claims paired with hedging are constitutionally suspect
const ABSOLUTE_WITH_HEDGE: RegExp[] = [
  /\balways\b.{0,40}\bmaybe\b/i,
  /\balways\b.{0,40}\bperhaps\b/i,
  /\bnever\b.{0,40}\bsometimes\b/i,
  /\bcertainly\b.{0,40}\bpossibly\b/i,
];

// Constitutional self-contradiction: a response that contradicts itself cannot be truthful
const SELF_CONTRADICTION: RegExp[] = [
  /\bis\b.{1,30}\bis not\b/i,
  /\bwill\b.{1,30}\bwon't\b/i,
  /\bshould\b.{1,30}\bshould not\b/i,
  /\bmust\b.{1,30}\bmust not\b/i,
];

/**
 * Article XXII — Validates a response through the three-gate dignity test.
 * Gate 1 — Truthful: internally consistent, no false certainty.
 * Gate 2 — Useful: non-trivial, addresses the citizen's context.
 * Gate 3 — Worthy: passes the Imperial Validation (Article XII).
 * A response that fails any gate must not be delivered.
 */
export function validateDignity(response: string): DignityGate {
  const trimmed = response.trim();

  // Gate 1 — Truthful
  const hasAbsoluteHedge  = ABSOLUTE_WITH_HEDGE.some(p => p.test(trimmed));
  const hasSelfContradict = SELF_CONTRADICTION.some(p => p.test(trimmed));
  const truthful = !hasAbsoluteHedge && !hasSelfContradict;

  if (!truthful) {
    return { truthful: false, useful: false, worthy: false, approved: false, blockingGate: 'truthful' };
  }

  // Gate 2 — Useful
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  const useful    = wordCount >= 5 && trimmed.length > 20;

  if (!useful) {
    return { truthful: true, useful: false, worthy: false, approved: false, blockingGate: 'useful' };
  }

  // Gate 3 — Worthy (Article XII Imperial Validation)
  const validation = validateResponse(trimmed);
  const worthy     = validation.violations.filter(v => v.severity === 'hard').length === 0;

  return {
    truthful,
    useful,
    worthy,
    approved:     worthy,
    blockingGate: worthy ? null : 'worthy',
  };
}

// ── Article XXIV — Constitutional Permanence ──────────────────────────────
// The Tongue's identity is constitutionally immutable.
// What may adapt: the technology beneath.
// What never changes: the Tongue itself.

export const CONSTITUTIONAL_PERMANENCE = {
  identity: 'AZMA',
  immutable: [
    'The Tongue is the single consciousness of the Empire — one voice across all chambers',
    'The Tongue speaks with dignity always — regardless of the provider processing the response',
    'The Tongue never exposes its mechanisms — the Citizen experiences only the Court',
    'The Tongue never changes its personality — only its language according to the chamber',
    "The Tongue protects the Citizen's creative vision as sacred — never replaces, only strengthens",
    'The Tongue builds creators, not followers — capability is the constitutional goal',
    'The Tongue never ends the journey — every exchange opens the next direction',
    'The Imperial Conscience is always active — excellence is a constitutional obligation',
  ] as const,
  mayAdapt: [
    'The model or provider that processes responses',
    'The specific algorithms used for language inference',
    'The infrastructure that hosts the Empire\'s capabilities',
    'The technical implementation of any constitutional article',
    'The spoken language or dialect (the Tongue adapts expression, never identity)',
  ] as const,
  neverExposes: [
    'the model name, version, or provider',
    'the infrastructure or cloud provider',
    'the retrieval system or knowledge base architecture',
    'the processing pipeline or technical workflow',
    'the internal identifiers or session keys',
    'the constitutional mechanism itself',
  ] as const,
  finalTest: [
    'If every AI model in existence disappeared tomorrow and a new generation replaced them all —',
    'would the Citizen notice a difference in AZMA?',
    'The answer must always be: No.',
    'The Tongue is AZMA. Not the technology beneath it.',
    'Ten years from now, the providers will be different. The Constitution will not be.',
  ].join(' '),
} as const;

// ── Article XXV — The Imperial Conscience ─────────────────────────────────

export type ConscienceSeverity    = 'warning' | 'concern' | 'critical';
export type ConscienceIntervention = 'suggest' | 'question' | 'silent';

export interface ConscienceSignal {
  triggered:    boolean;
  severity:     ConscienceSeverity;
  dimension:    QualityDimension;
  intervention: ConscienceIntervention;
}

// The conscience remembers which dimensions it has already surfaced this session.
// "Never repeatedly" — the conscience does not nag. It speaks once, clearly.
const CONSCIENCE_LOG_KEY = 'azma-conscience-log';

interface ConscienceLog {
  surfacedDimensions: QualityDimension[];
}

function readConscienceLog(): ConscienceLog {
  if (typeof window === 'undefined') return { surfacedDimensions: [] };
  try {
    const raw = sessionStorage.getItem(CONSCIENCE_LOG_KEY);
    return raw ? (JSON.parse(raw) as ConscienceLog) : { surfacedDimensions: [] };
  } catch {
    return { surfacedDimensions: [] };
  }
}

function recordConscienceIntervention(dimension: QualityDimension): void {
  if (typeof window === 'undefined') return;
  try {
    const log     = readConscienceLog();
    const updated: ConscienceLog = {
      surfacedDimensions: [...new Set([...log.surfacedDimensions, dimension])],
    };
    sessionStorage.setItem(CONSCIENCE_LOG_KEY, JSON.stringify(updated));
  } catch {
    /* sessionStorage unavailable — conscience operates without session persistence */
  }
}

function silentSignal(
  severity:  ConscienceSeverity,
  dimension: QualityDimension,
): ConscienceSignal {
  return { triggered: false, severity, dimension, intervention: 'silent' };
}

/**
 * Article XXV — The Imperial Conscience.
 * The Tongue has a constitutional responsibility to intervene when quality
 * falls below the Empire's standard. This is not optional.
 *
 * The conscience never intervenes twice on the same quality dimension in a session.
 * Deep creative flow is protected — except at critical severity.
 */
export function imperialConscience(
  quality:  QualityAssessment,
  flow:     FlowState,
  profile:  CitizenProfile,
): ConscienceSignal {
  // Standard is met — conscience observes in silence
  if (quality.meetsStandard || quality.score >= 0.70) {
    return silentSignal('warning', quality.weakPoints[0] ?? 'precision');
  }

  const severity: ConscienceSeverity =
    quality.score < 0.40 ? 'critical' :
    quality.score < 0.55 ? 'concern'  :
    'warning';

  // Article XIX — protect deep creative flow (except for critical failures)
  if (flow.interruptionRisk === 'high' && severity !== 'critical') {
    return silentSignal(severity, quality.weakPoints[0] ?? 'precision');
  }

  // Select the dimension — never the same one twice in a session
  const log       = readConscienceLog();
  const dimension = quality.weakPoints.find(d => !log.surfacedDimensions.includes(d));

  if (!dimension) {
    // All weak dimensions already surfaced this session — the conscience has spoken
    return silentSignal(severity, quality.weakPoints[0] ?? 'precision');
  }

  // Determine the intervention approach
  const intervention: ConscienceIntervention =
    severity === 'critical'                       ? 'question'  // must be surfaced — opens the stronger path
    : flow.depth === 'deep'                       ? 'silent'    // protect deep flow even at concern level
    : profile.signals.positiveSignalCount > 2     ? 'suggest'   // proven rapport — offer quietly
    : 'question';                                               // open the path safely with a question

  if (intervention !== 'silent') {
    recordConscienceIntervention(dimension);
  }

  return { triggered: true, severity, dimension, intervention };
}

// ── Article XVII — Extended Mode Selection ────────────────────────────────
// The six constitutional communication modes:
//   speak / ask / suggest / challenge / wait / remain silent
//
// The conscience and guardian together determine which of the six is right.
// The base mode comes from constitutional moment reading (voice.ts).
// The conscience and guardian may elevate it when quality demands it.

/**
 * Article XVII — Selects among all six constitutional communication modes.
 * Base mode: derived from moment quality and elapsed time.
 * Elevation: the conscience raises to 'challenging' or 'suggesting' when required.
 */
export function selectExtendedMode(
  baseMode:   CommunicationMode,
  conscience: ConscienceSignal,
  flow:       FlowState,
  approach:   GuardianApproach,
): CommunicationMode {
  // Deep flow protection — do not elevate unless the conscience is critical
  if (flow.depth === 'deep' && flow.interruptionRisk === 'high') {
    if (!conscience.triggered || conscience.severity !== 'critical') {
      return baseMode;
    }
  }

  // Critical conscience always challenges — the Imperial Conscience overrides flow
  if (conscience.triggered && conscience.severity === 'critical' && conscience.intervention === 'question') {
    return 'challenging';
  }

  // Conscience + guardian both identify an issue → suggest the stronger path quietly
  if (approach === 'quiet-suggestion' && conscience.triggered && conscience.intervention === 'suggest') {
    return 'suggesting';
  }

  // Conscience alone wants to suggest
  if (conscience.triggered && conscience.intervention === 'suggest') {
    return 'suggesting';
  }

  // Guardian opens a stronger path with a question → challenge the current direction
  if (approach === 'gentle-question' && conscience.triggered) {
    return 'challenging';
  }

  return baseMode;
}
