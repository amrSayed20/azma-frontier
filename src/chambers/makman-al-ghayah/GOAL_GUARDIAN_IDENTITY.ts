/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER III — GOAL GUARDIAN (LAYER COMPONENT A: GUARDIAN IDENTITY)
 * (Construction ID MAG-PKG-III-L03)
 *
 * DECLARATIVE ONLY. Defines the constitutional identity of Goal Guardian:
 * purpose, scope, authority, ownership, lifetime, and its relationship
 * with Awareness. Zero modification to any certified Package or to Living
 * Layers I/II. Guardian consumes Goal Awareness exclusively — the same
 * layering discipline established by GOAL_AWARENESS_RELATIONSHIP_WITH_PRESENCE
 * (Living Layer II), applied one level up: each Living Layer reads the
 * Goal only through the Layer immediately beneath it, never reaching past
 * it into an earlier Layer or into Package II directly.
 */

import type { GoalAwarenessIdentity } from './GOAL_AWARENESS_IDENTITY';

export interface GoalGuardianIdentity {
  readonly awarenessId: GoalAwarenessIdentity['awarenessId'];
  readonly guardianId: string;
}

export const GOAL_GUARDIAN_PURPOSE = {
  statement: 'Goal Guardian exists to preserve the constitutional integrity of every entrusted Goal throughout its entrusted lifetime. It transforms Understanding into Protection. It never transforms Protection into Decision.',
  distinctFromAwareness: 'Awareness answers "What is happening to the Goal?" (Article II\'s Analyze verb). Guardian answers "Is what is happening to the Goal still constitutional?" — the Article II verb it exercises is Protect, not Analyze. Awareness supplies the classification; Guardian watches that classification for constitutional violation risk, without ever deciding, executing, or replacing the Creator\'s decision.',
} as const;

export const GOAL_GUARDIAN_SCOPE = {
  statement: 'One Goal Guardian covers exactly one Goal Awareness — never a Goal Presence directly, never a Package II Architectural Component directly, and never more than one Awareness at a time.',
  constitutionalGrounding: 'Layering discipline generalized from GOAL_PRESENCE_MANDATORY_BRIDGE_RULING (Living Layer I) and MAG-CA-RULING-005 (Living Layer II): Presence observes, Awareness understands, Guardian protects — each Layer consumes only the Layer immediately beneath it.',
} as const;

export const GOAL_GUARDIAN_AUTHORITY = {
  statement: 'Goal Guardian holds exactly one authority: Protect (Article II) — applied only to what Awareness already classified. It holds none of Article II\'s other six verbs (Observe, Analyze, Recommend, Warn, Re-evaluate, Plan). "Guardian shall own protection only" — it owns no execution, no recommendation delivery, no scheduling, no decision replacement.',
  constitutionalGrounding: 'ARTICLE II (naming Protect among the Creator-Authority-bounded verbs); this Package\'s own Constitutional Purpose ("Guardian protects. Guardian shall never execute. Guardian shall never replace Creator Authority.").',
} as const;

export const GOAL_GUARDIAN_OWNERSHIP = {
  guardianItself: 'Makman Al-Ghayah owns the Guardian (the violation-detection/protection mechanism).',
  theProtection: 'Makman owns the act of detecting and escalating; it never owns the Goal, and it never owns the resolution of an escalation — that decision remains the Creator\'s.',
  theGoal: 'The Creator owns the Goal exclusively — unchanged from Package I/II and Living Layers I/II.',
  constitutionalGrounding: 'ARTICLE VII, ARTICLE IX (carried forward unchanged).',
} as const;

export const GOAL_GUARDIAN_LIFETIME = {
  beginsAndEnds: 'Identical to its one Awareness\'s lifetime (GOAL_AWARENESS_LIFETIME, Living Layer II), which is itself identical to Presence\'s lifetime (Living Layer I) — Guardian cannot begin before its Awareness exists, and cannot outlive it. No independent lifetime is introduced.',
  constitutionalGrounding: 'ARTICLE X, applied identically across all three Layers.',
} as const;

export const GOAL_GUARDIAN_RELATIONSHIP_WITH_AWARENESS = {
  statement: 'Guardian consumes Awareness exclusively. It never queries GOAL_PRESENCE_*.ts (Living Layer I) directly, and it never queries GOAL_CUSTODY_COMPONENT, GOAL_PROGRESS_COMPONENT, or any other Package II Architectural Component directly.',
  constitutionalGrounding: 'Layering discipline generalized from MAG-CA-RULING-005, extended one Layer up by this Package\'s own narrative ("Presence observes. Awareness understands. Guardian protects.").',
  verifiedCompliance: 'Every import in this file and its sibling GOAL_GUARDIAN_*.ts files resolves to GOAL_AWARENESS_IDENTITY.ts, GOAL_AWARENESS_CONTEXT.ts, or GOAL_AWARENESS_CLASSIFICATION.ts (Living Layer II) — confirmed by direct inspection of every import statement before this Layer was written.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_GUARDIAN_IDENTITY_DECLARATION = {
  decisionAuthorityIntroduced: false,
  executionAuthorityIntroduced: false,
  creatorAuthorityOverridden: false,
  directPresenceOrPackageIIAccess: false,
  packageIModified: false,
  packageIIModified: false,
  livingLayerIModified: false,
  livingLayerIIModified: false,
  status: 'LIVING LAYER III, LAYER COMPONENT A, GOAL GUARDIAN IDENTITY, complete.',
} as const;

export const MAKMAN_GOAL_GUARDIAN_IDENTITY = {
  purpose: GOAL_GUARDIAN_PURPOSE,
  scope: GOAL_GUARDIAN_SCOPE,
  authority: GOAL_GUARDIAN_AUTHORITY,
  ownership: GOAL_GUARDIAN_OWNERSHIP,
  lifetime: GOAL_GUARDIAN_LIFETIME,
  relationshipWithAwareness: GOAL_GUARDIAN_RELATIONSHIP_WITH_AWARENESS,
  declaration: GOAL_GUARDIAN_IDENTITY_DECLARATION,
} as const;
