/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER III — GOAL GUARDIAN (LAYER COMPONENT D: GUARDIAN ESCALATION)
 * (Construction ID MAG-PKG-III-L03)
 *
 * DECLARATIVE ONLY. Architects escalation — the shape of a detected
 * violation risk being raised, never resolved, by Guardian. No execution:
 * this file defines an interface and static tables, not a function that
 * sends anything.
 *
 * HONESTY CHECK performed before writing: Article IV (Suggestion) and
 * Article V (Notification) name RECOMMENDATION_COMPONENT and
 * NOTIFICATION_COMPONENT as the eventual delivery mechanisms for exactly
 * this kind of output, but MAKMAN_CHAMBER_ARCHITECTURE.ts (Package II)
 * marks both RESERVED with zero implementing files. Escalation Destination
 * below is therefore named as the Creator (the constitutional endpoint,
 * Article VIII), with the delivery mechanism honestly left open rather
 * than invented — see ESCALATION_DELIVERY_MECHANISM_GAP.
 */

import type { GoalGuardianProtectionDomain } from './GOAL_GUARDIAN_PROTECTION';

export interface RasAlAmrGoalGuardianEscalation {
  readonly triggeringDomain: GoalGuardianProtectionDomain;
  readonly raisedBy: 'makman-al-ghayah-guardian';
  readonly destination: 'the-creator';
  readonly resolvedBy: 'the-creator';
}

export const GOAL_GUARDIAN_ESCALATION_TRIGGERS = [
  { domain: 'Creator Authority Protection', trigger: 'currentCreatorAuthorizationStatus === "awaiting-authorization" persisting while the Journey continues to advance.' },
  { domain: 'Goal Integrity Protection', trigger: 'A Goal mutation occurring without a preceding Creator-authorized action (conceptually — Guardian names this trigger; it has no runtime means to observe it occurring).' },
  { domain: 'Journey Continuity Protection', trigger: 'currentJourneyState remaining unchanged for longer than the Goal\'s entrusted lifetime should tolerate, without reaching a terminal condition (Article X).' },
  { domain: 'Constitutional Boundary Protection', trigger: 'currentClassification indicating a Forbidden-Authority-adjacent condition (e.g., Cancelled, given the CANCELLED_CLASSIFICATION_GAP\'s imprecision).' },
] as const satisfies readonly { domain: GoalGuardianProtectionDomain; trigger: string }[];

export const GOAL_GUARDIAN_ESCALATION_OWNERSHIP = {
  raisingTheEscalation: 'Makman Al-Ghayah (the Guardian) owns detecting the condition and raising the escalation.',
  resolvingTheEscalation: 'The Creator owns resolving it exclusively — Guardian never resolves its own escalation, never times it out, never acts in the Creator\'s place.',
  constitutionalGrounding: 'ARTICLE II, ARTICLE IX — Guardian is a Guardian, not a decision maker.',
} as const;

export const GOAL_GUARDIAN_ESCALATION_DESTINATION = {
  statement: 'Every escalation\'s constitutional destination is the Creator (Article VIII\'s approval authority).',
  deliveryMechanism: 'Not yet built. Article IV/V name Recommendation and Notification as the intended eventual delivery paths, but both are RESERVED components (MAKMAN_CHAMBER_ARCHITECTURE.ts) with zero implementing files today.',
} as const;

export const ESCALATION_DELIVERY_MECHANISM_GAP = {
  finding: 'Guardian can name that an escalation must reach the Creator, and can name the triggering domain, but has no built mechanism to actually deliver it — RECOMMENDATION_COMPONENT and NOTIFICATION_COMPONENT remain RESERVED, zero implementing files, since Package II.',
  disposition: 'Documented as an open architectural dependency, not fixed here — building either reserved component is out of scope for a documentation-only Living Layer.',
  recommendation: 'RECOMMENDATION_COMPONENT and/or NOTIFICATION_COMPONENT should be constructed before Guardian escalation can become anything more than a declarative concept.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_GUARDIAN_ESCALATION_DECLARATION = {
  everyTriggerMapsToAProtectionDomain: true,
  executionIntroduced: false,
  deliveryMechanismInvented: false,
  status: 'LIVING LAYER III, LAYER COMPONENT D, GOAL GUARDIAN ESCALATION, complete. Escalation architected as a concept; delivery mechanism honestly left as an open dependency on two RESERVED Package II components.',
} as const;

export const MAKMAN_GOAL_GUARDIAN_ESCALATION = {
  triggers: GOAL_GUARDIAN_ESCALATION_TRIGGERS,
  ownership: GOAL_GUARDIAN_ESCALATION_OWNERSHIP,
  destination: GOAL_GUARDIAN_ESCALATION_DESTINATION,
  deliveryMechanismGap: ESCALATION_DELIVERY_MECHANISM_GAP,
  declaration: GOAL_GUARDIAN_ESCALATION_DECLARATION,
} as const;
