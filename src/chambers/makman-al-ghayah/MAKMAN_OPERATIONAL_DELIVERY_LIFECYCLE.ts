/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * OPERATIONAL FOUNDATION — RECOMMENDATION & NOTIFICATION OPERATIONAL SYSTEM
 * (WORK PACKAGE D: DELIVERY LIFECYCLE & MESSAGE FLOW)
 * (Construction ID MAG-OPF-002)
 *
 * Documents the Delivery Lifecycle and Message Flow this directive's
 * Engineering Report requires. Architecture description of
 * MAKMAN_OPERATIONAL_DELIVERY_SYSTEM.ts's actual behavior — not a
 * restatement with new rules.
 */

export const MAKMAN_DELIVERY_LIFECYCLE_STAGES = [
  'Runtime Output Produced',
  'Received by Delivery System',
  'Constitutional Integrity Validated',
  'Held, Ready for Creator',
] as const;
export type MakmanDeliveryLifecycleStage = (typeof MAKMAN_DELIVERY_LIFECYCLE_STAGES)[number];

export interface RasAlAmrMakmanDeliveryLifecycleStageDefinition {
  readonly stage: MakmanDeliveryLifecycleStage;
  readonly description: string;
  readonly performedBy: string;
}

export const MAKMAN_DELIVERY_LIFECYCLE_STAGE_DEFINITIONS: readonly RasAlAmrMakmanDeliveryLifecycleStageDefinition[] = [
  {
    stage: 'Runtime Output Produced',
    description: 'A caller, having driven MakmanGoalRuntime (MAG-OPF-001) through its stages, separately constructs a RasAlAmrGoalStrategyRecommendation or GoalNotification value and gathers a RuntimeChainContext from the Identity values each Runtime stage already returned.',
    performedBy: 'The Runtime\'s caller — not the Delivery System, not Runtime Core itself.',
  },
  {
    stage: 'Received by Delivery System',
    description: 'MakmanDeliverySystem.receiveRecommendation() or .receiveNotification() is called with the content and its RuntimeChainContext.',
    performedBy: 'MakmanDeliverySystem (MAKMAN_OPERATIONAL_DELIVERY_SYSTEM.ts).',
  },
  {
    stage: 'Constitutional Integrity Validated',
    description: 'The content\'s own already-declared invariants are checked unchanged: isExecutable must be false; destination must be "the-creator"; a Recommendation must also preservesCreatorAuthority. Any violation throws MakmanDeliveryIntegrityError — the record is never stored.',
    performedBy: 'MakmanDeliverySystem, using only fields the content already carries — no new judgment is introduced.',
  },
  {
    stage: 'Held, Ready for Creator',
    description: 'A RasAlAmrMakmanDeliveryRecord is stored, status "ready-for-creator". This is the final stage this Package produces — no transport, no "delivered" or "acknowledged" status exists here.',
    performedBy: 'MakmanDeliverySystem\'s in-memory store (analogous in shape to goal-state.ts\'s own Map-based store).',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// MESSAGE FLOW
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_DELIVERY_MESSAGE_FLOW = {
  recommendationPath: 'Goal Strategy (content) + Runtime Core stage returns (chain context) → MakmanDeliverySystem.receiveRecommendation() → RasAlAmrMakmanDeliveryRecord<RasAlAmrGoalStrategyRecommendation>, status "ready-for-creator".',
  notificationPath: 'Goal Awareness classification change (content, newly shaped as GoalNotification) + Runtime Core stage returns (chain context) → MakmanDeliverySystem.receiveNotification() → RasAlAmrMakmanDeliveryRecord<GoalNotification>, status "ready-for-creator".',
  whatHappensNext: 'Undefined by this Package — a future, separately-authorized transport/Gateway package is required to move a "ready-for-creator" record to an actual Creator-facing surface. This Package does not claim that step exists.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_OPERATIONAL_DELIVERY_LIFECYCLE_DECLARATION = {
  totalStages: MAKMAN_DELIVERY_LIFECYCLE_STAGES.length,
  transportStageClaimed: false,
  status: 'OPERATIONAL FOUNDATION (MAG-OPF-002), WORK PACKAGE D, DELIVERY LIFECYCLE & MESSAGE FLOW, complete.',
} as const;

export const MAKMAN_OPERATIONAL_DELIVERY_LIFECYCLE_SUMMARY = {
  stages: MAKMAN_DELIVERY_LIFECYCLE_STAGES,
  stageDefinitions: MAKMAN_DELIVERY_LIFECYCLE_STAGE_DEFINITIONS,
  messageFlow: MAKMAN_DELIVERY_MESSAGE_FLOW,
  declaration: MAKMAN_OPERATIONAL_DELIVERY_LIFECYCLE_DECLARATION,
} as const;
