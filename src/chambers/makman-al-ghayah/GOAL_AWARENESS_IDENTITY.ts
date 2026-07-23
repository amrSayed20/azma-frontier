/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER II — GOAL AWARENESS (LAYER COMPONENT A: AWARENESS IDENTITY)
 * (Construction ID MAG-PKG-III-L02)
 *
 * DECLARATIVE ONLY. Defines the constitutional identity of Goal Awareness:
 * purpose, scope, authority, ownership, lifetime, and its relationship
 * with Presence. Zero modification to any certified Package or to Living
 * Layer I. Complies with MAG-CA-RULING-005 (Presence First Principle) —
 * every type imported below comes from GOAL_PRESENCE_*.ts (Living Layer
 * I), never from a Package II Architectural Component directly.
 */

import type { GoalPresenceIdentity } from './GOAL_PRESENCE_IDENTITY';

export interface GoalAwarenessIdentity {
  readonly presenceId: GoalPresenceIdentity['presenceId'];
  readonly awarenessId: string;
}

export const GOAL_AWARENESS_PURPOSE = {
  statement: 'Goal Awareness exists to continuously understand the constitutional condition of every entrusted Goal. It transforms Presence into Understanding. It never transforms Understanding into Decision.',
  distinctFromPresence: 'Presence answers "Where is the Goal?" (Layer I, Article II\'s Observe verb). Awareness answers "What is happening to the Goal?" — the Article II verb it exercises is Analyze, not Observe. Presence supplies the raw, observed facts; Awareness interprets those facts into a bounded classification (GOAL_AWARENESS_CLASSIFICATION.ts) without ever deciding, recommending, or acting on them.',
} as const;

export const GOAL_AWARENESS_SCOPE = {
  statement: 'One Goal Awareness covers exactly one Goal Presence — never a Goal directly, and never more than one Presence at a time.',
  constitutionalGrounding: 'MAG-CA-RULING-005 (Presence First Principle): "Living Layer II shall consume information only through Goal Presence. Direct access to Package II Architectural Components is prohibited." Awareness has no scope of its own beyond what its one Presence exposes.',
} as const;

export const GOAL_AWARENESS_AUTHORITY = {
  statement: 'Goal Awareness holds exactly one authority: Analyze (Article II) — applied only to what Presence already observed. It holds none of Article II\'s other six verbs. "Awareness shall own understanding only" — it owns no decision, no recommendation, no execution.',
  constitutionalGrounding: 'ARTICLE II; this Package\'s own Constitutional Purpose.',
} as const;

export const GOAL_AWARENESS_OWNERSHIP = {
  awarenessItself: 'Makman Al-Ghayah owns the Awareness (the classification/understanding mechanism).',
  theUnderstanding: 'Makman owns the classification produced; it never owns the Goal or the Creator\'s decision authority over it.',
  theGoal: 'The Creator owns the Goal exclusively — unchanged from Package I/II and Living Layer I.',
  constitutionalGrounding: 'ARTICLE VII, ARTICLE IX (carried forward unchanged).',
} as const;

export const GOAL_AWARENESS_LIFETIME = {
  beginsAndEnds: 'Identical to its one Presence\'s lifetime (GOAL_PRESENCE_LIFETIME, Living Layer I) — Awareness cannot begin before its Presence exists, and cannot outlive it. No independent lifetime is introduced.',
  constitutionalGrounding: 'ARTICLE X, applied identically to both Layers.',
} as const;

export const GOAL_AWARENESS_RELATIONSHIP_WITH_PRESENCE = {
  statement: 'Awareness consumes Presence exclusively. It never queries GOAL_CUSTODY_COMPONENT, GOAL_PROGRESS_COMPONENT, or any other Package II Architectural Component directly.',
  constitutionalGrounding: 'MAG-CA-RULING-005 (Presence First Principle), cited by this Package\'s own Architectural Authority section.',
  verifiedCompliance: 'Every import in this file and its sibling GOAL_AWARENESS_*.ts files resolves to GOAL_PRESENCE_IDENTITY.ts or GOAL_PRESENCE_CONTEXT.ts (Living Layer I) — confirmed by direct inspection of every import statement before this Layer was written.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_AWARENESS_IDENTITY_DECLARATION = {
  decisionAuthorityIntroduced: false,
  recommendationAuthorityIntroduced: false,
  executionAuthorityIntroduced: false,
  directPackageIIAccess: false,
  packageIModified: false,
  packageIIModified: false,
  livingLayerIModified: false,
  status: 'LIVING LAYER II, LAYER COMPONENT A, GOAL AWARENESS IDENTITY, complete.',
} as const;

export const RAS_AL_AMR_GOAL_AWARENESS_IDENTITY = {
  purpose: GOAL_AWARENESS_PURPOSE,
  scope: GOAL_AWARENESS_SCOPE,
  authority: GOAL_AWARENESS_AUTHORITY,
  ownership: GOAL_AWARENESS_OWNERSHIP,
  lifetime: GOAL_AWARENESS_LIFETIME,
  relationshipWithPresence: GOAL_AWARENESS_RELATIONSHIP_WITH_PRESENCE,
  declaration: GOAL_AWARENESS_IDENTITY_DECLARATION,
} as const;
