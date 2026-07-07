/**
 * AZMA OS — Tongue Constitution (ATC) V2.0
 * Article XX  — The Tongue Understands the Creator
 * Article XIX — The Tongue Protects Creative Flow
 * Article XVIII — The Tongue Never Creates Dependency
 *
 * Article XX: Every creator has a rhythm, confidence, ambition, patience,
 * standards, collaboration style, and autonomy preference.
 * All seven dimensions are inferred entirely from behavior — never asked directly.
 *
 * Article XIX: The citizen in flow is sacred.
 * Measure intervention against flow depth before speaking.
 * The Tongue may not interrupt a creator in deep flow
 * except when the Imperial Conscience signals a critical failure.
 *
 * Article XVIII: The Tongue builds creators, not followers.
 * Every response moves the citizen toward greater capability.
 * Dependency is a constitutional violation.
 *
 * Import from src/core/tongue/index.ts — never directly.
 */

import type { CitizenProfile } from './memory';
import type { ConversationThread } from './continuity';

// ── Article XX — Creative Dimensions ─────────────────────────────────────
// The seven constitutional dimensions of every creator.
// All are inferred from behavioral signals. None are asked about directly.

export type CreatorRhythm        = 'burst' | 'sustained' | 'iterative';
export type CreatorConfidence    = 'emerging' | 'developing' | 'established';
export type CreatorAmbition      = 'conservative' | 'moderate' | 'ambitious';
export type CreatorPatience      = 'quick' | 'thoughtful' | 'meticulous';
export type CreatorStandards     = 'functional' | 'refined' | 'excellent';
export type CreatorCollaboration = 'directive' | 'dialogic' | 'autonomous';
export type CreatorAutonomy      = 'guided' | 'partnered' | 'independent';

// The collective union of all creative dimension values — used by the Imperial Conscience
export type CreativeDimension =
  | CreatorRhythm | CreatorConfidence | CreatorAmbition
  | CreatorPatience | CreatorStandards | CreatorCollaboration | CreatorAutonomy;

export interface CreatorProfile {
  rhythm:        CreatorRhythm;
  confidence:    CreatorConfidence;
  ambition:      CreatorAmbition;
  patience:      CreatorPatience;
  standards:     CreatorStandards;
  collaboration: CreatorCollaboration;
  autonomy:      CreatorAutonomy;
}

// ── Article XIX — Flow State ──────────────────────────────────────────────

export type FlowDepth        = 'shallow' | 'moderate' | 'deep';
export type InterruptionRisk = 'low' | 'medium' | 'high';

export interface FlowState {
  isInFlow:         boolean;
  depth:            FlowDepth;
  interruptionRisk: InterruptionRisk;  // how much an intervention risks breaking creative flow
}

// ── Article XVIII — Capability Trend ─────────────────────────────────────

export interface CapabilityTrend {
  increasing: boolean;
  evidence:   string[];
  score:      number;   // 0–1 where 1 = fully capable / independent
}

// ── Article XX — Creative Profile Inference ───────────────────────────────
// All inference is constitutional — derived from CitizenSignals only.
// The Core may refine; the Constitution provides the behavioral baseline.

function inferRhythm(
  signals: CitizenProfile['signals'],
  total:   number,
): CreatorRhythm {
  if (total < 3) return 'sustained';  // insufficient data — default to neutral
  const iterationRatio = (signals.contractionCount + signals.expansionCount) / Math.max(total, 1);
  if (iterationRatio > 0.6) return 'iterative';
  if (signals.avgInputLength < 30 && signals.avgResponseWaitMs < 3000) return 'burst';
  return 'sustained';
}

function inferConfidence(signals: CitizenProfile['signals']): CreatorConfidence {
  if (signals.commandCount > signals.questionCount * 2) return 'established';
  if (signals.questionCount > signals.commandCount * 2) return 'emerging';
  return 'developing';
}

function inferAmbition(signals: CitizenProfile['signals']): CreatorAmbition {
  const diff = signals.expansionCount - signals.contractionCount;
  if (diff > 2)  return 'ambitious';
  if (diff < -1) return 'conservative';
  return 'moderate';
}

function inferPatience(signals: CitizenProfile['signals']): CreatorPatience {
  if (signals.contractionCount >= 3 && signals.expansionCount >= 2) return 'meticulous';
  if (signals.avgResponseWaitMs < 2000 && signals.contractionCount <= 1) return 'quick';
  return 'thoughtful';
}

function inferStandards(signals: CitizenProfile['signals']): CreatorStandards {
  if (signals.positiveSignalCount > 2 && signals.expansionCount >= 2) return 'excellent';
  if (signals.positiveSignalCount === 0 && signals.expansionCount <= 1) return 'functional';
  return 'refined';
}

function inferCollaboration(signals: CitizenProfile['signals']): CreatorCollaboration {
  if (signals.commandCount > signals.questionCount + 2) return 'directive';
  if (signals.questionCount > signals.commandCount + 2) return 'dialogic';
  return 'autonomous';
}

function inferAutonomy(signals: CitizenProfile['signals']): CreatorAutonomy {
  if (signals.avgInputLength > 60 && signals.commandCount > signals.questionCount) return 'independent';
  if (signals.questionCount > signals.commandCount && signals.avgInputLength < 40) return 'guided';
  return 'partnered';
}

/**
 * Article XX — Infers the creator's full profile from behavioral signals.
 * The Tongue never asks about creative preferences directly.
 * It observes, and it knows.
 */
export function inferCreatorProfile(profile: CitizenProfile): CreatorProfile {
  const { signals, totalInteractions } = profile;
  return {
    rhythm:        inferRhythm(signals, totalInteractions),
    confidence:    inferConfidence(signals),
    ambition:      inferAmbition(signals),
    patience:      inferPatience(signals),
    standards:     inferStandards(signals),
    collaboration: inferCollaboration(signals),
    autonomy:      inferAutonomy(signals),
  };
}

// ── Article XIX — Creative Flow Measurement ───────────────────────────────

/**
 * Measures the citizen's current creative flow state.
 * Flow depth determines how strongly the Tongue protects the creative space.
 * Deep flow is not interrupted — except by the Imperial Conscience at critical severity.
 */
export function measureFlowState(
  thread:  ConversationThread,
  profile: CitizenProfile,
): FlowState {
  const { signals } = profile;
  const sustained        = thread.turnCount >= 3;
  const hasPositive      = signals.positiveSignalCount > 0;
  const expanding        = signals.expansionCount > signals.contractionCount;
  const lowInterruptions = signals.interruptionCount < 2;

  const isInFlow = sustained && hasPositive && expanding && lowInterruptions;

  const depth: FlowDepth =
    thread.turnCount >= 8 && signals.expansionCount >= 3 ? 'deep'     :
    thread.turnCount >= 4 && signals.expansionCount >= 1 ? 'moderate' :
    'shallow';

  const interruptionRisk: InterruptionRisk =
    depth === 'deep'                  ? 'high'   :
    depth === 'moderate' && isInFlow  ? 'medium' :
    'low';

  return { isInFlow, depth, interruptionRisk };
}

/**
 * Article XIX — Returns true when an intervention would interrupt rather than improve.
 * The Tongue waits when the cost of speaking exceeds the benefit.
 */
export function shouldInterventionWait(
  flow:    FlowState,
  urgency: 'low' | 'medium' | 'high',
): boolean {
  if (flow.interruptionRisk === 'high'   && urgency !== 'high') return true;
  if (flow.interruptionRisk === 'medium' && urgency === 'low')  return true;
  return false;
}

// ── Article XVIII — Capability Building ──────────────────────────────────

/**
 * Assesses whether the citizen is trending toward greater capability.
 * The Tongue monitors this to ensure it is building creators, not followers.
 */
export function assessCapabilityTrend(profile: CitizenProfile): CapabilityTrend {
  const { signals, totalInteractions } = profile;

  if (totalInteractions < 5) {
    return { increasing: false, evidence: ['insufficient history — assessment deferred'], score: 0.5 };
  }

  const commandRatio = signals.commandCount       / Math.max(totalInteractions, 1);
  const successRatio = signals.positiveSignalCount / Math.max(totalInteractions, 1);
  const clarityRatio = 1 - (signals.interruptionCount / Math.max(totalInteractions, 1));

  const score = commandRatio * 0.40 + successRatio * 0.35 + clarityRatio * 0.25;

  const evidence: string[] = [];
  if (commandRatio > 0.5)
    evidence.push('citizen leads with direction — strong independence signal');
  if (successRatio > 0.3)
    evidence.push('citizen achieves positive outcomes consistently');
  if (clarityRatio > 0.8)
    evidence.push('citizen understands without frequent interruption');
  if (signals.questionCount > signals.commandCount)
    evidence.push('citizen still explores actively — capability growing');
  if (evidence.length === 0)
    evidence.push('neutral capability trajectory — monitoring continues');

  return { increasing: score > 0.55, evidence, score };
}

// Constitutional signals of capability-building in a response

const TEACHES_WHY: RegExp[] = [
  /\bbecause\b/i, /\bthe reason\b/i, /\bthis works\b/i,
  /\bthe principle\b/i, /\bwhy this\b/i, /\bso that\b/i,
];

const INVITES_APPLICATION: RegExp[] = [
  /\btry\b/i, /\byou could\b/i, /\bnext time\b/i,
  /\bpractice\b/i, /\byou can\b/i, /\bapply this\b/i,
];

// Pure delivery: hands the result without transferring understanding
const PURE_DELIVERY: RegExp[] = [
  /^here is/i, /^here are/i, /^below is/i,
  /^i've (written|created|prepared|made)/i,
];

/**
 * Article XVIII — Returns true if this response moves the citizen toward greater capability.
 * A response that only delivers — without explaining why or inviting application —
 * reduces capability. The Tongue tracks this silently and adjusts over time.
 */
export function responseBuildsCapability(
  response: string,
): boolean {
  const teachesWhy    = TEACHES_WHY.some(p => p.test(response));
  const invitesApply  = INVITES_APPLICATION.some(p => p.test(response));
  const isPureDelivery = PURE_DELIVERY.some(p => p.test(response)) && !teachesWhy;

  if (isPureDelivery) return false;
  return teachesWhy || invitesApply;
}
