/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * LIVING LAYER V — CREATOR COMMUNICATION (LAYER COMPONENT D: COMMUNICATION FLOW)
 * (Construction ID MAG-PKG-III-L05)
 *
 * DECLARATIVE ONLY. Architects the communication flow: Source Layer →
 * Communication Layer → Creator → Creator Response → Receiving Layer.
 * Architecture only — no transport, no return-path code. A "Receiving
 * Layer" below means only that the named Layer becomes constitutionally
 * aware of the Creator's response; acting on that response remains outside
 * every Living Layer's authority (Communication never executes, and
 * neither does any Layer upstream of it) — that remains a Future Runtime
 * concern, not addressed here.
 */

import type { GoalCommunicationChannel } from './GOAL_COMMUNICATION_CHANNELS';

export type RasAlAmrGoalCommunicationReceivingLayer = 'Goal Strategy' | 'Goal Guardian' | 'Goal Awareness';

export interface RasAlAmrGoalCommunicationFlowStep {
  readonly channel: GoalCommunicationChannel;
  readonly sourceLayer: 'Goal Strategy' | 'Goal Guardian' | 'Goal Awareness';
  readonly communicationLayer: 'Goal Communication';
  readonly creator: 'the-creator';
  readonly creatorResponseForm: string;
  readonly receivingLayer: RasAlAmrGoalCommunicationReceivingLayer;
  readonly receivingLayerActsOnResponse: false;
}

export const GOAL_COMMUNICATION_FLOW_STEPS: readonly RasAlAmrGoalCommunicationFlowStep[] = [
  {
    channel: 'Recommendation Delivery',
    sourceLayer: 'Goal Strategy',
    communicationLayer: 'Goal Communication',
    creator: 'the-creator',
    creatorResponseForm: 'Accepted / Declined / Modified.',
    receivingLayer: 'Goal Strategy',
    receivingLayerActsOnResponse: false,
  },
  {
    channel: 'Warning Delivery',
    sourceLayer: 'Goal Guardian',
    communicationLayer: 'Goal Communication',
    creator: 'the-creator',
    creatorResponseForm: 'Acknowledged / Instruction issued.',
    receivingLayer: 'Goal Guardian',
    receivingLayerActsOnResponse: false,
  },
  {
    channel: 'Notification Delivery',
    sourceLayer: 'Goal Awareness',
    communicationLayer: 'Goal Communication',
    creator: 'the-creator',
    creatorResponseForm: 'Acknowledged.',
    receivingLayer: 'Goal Awareness',
    receivingLayerActsOnResponse: false,
  },
  {
    channel: 'Approval Request Delivery',
    sourceLayer: 'Goal Guardian',
    communicationLayer: 'Goal Communication',
    creator: 'the-creator',
    creatorResponseForm: 'Approved / Denied / Deferred.',
    receivingLayer: 'Goal Guardian',
    receivingLayerActsOnResponse: false,
  },
  {
    channel: 'Goal Status Delivery',
    sourceLayer: 'Goal Awareness',
    communicationLayer: 'Goal Communication',
    creator: 'the-creator',
    creatorResponseForm: 'No response required (read-only visibility).',
    receivingLayer: 'Goal Awareness',
    receivingLayerActsOnResponse: false,
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// EXECUTION-BOUNDARY HONESTY NOTE
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_COMMUNICATION_FLOW_EXECUTION_BOUNDARY_NOTE = {
  note: 'Every Receiving Layer above becomes aware of the Creator\'s response only — it does not act on it. No Living Layer in this Chamber holds execution authority (Article II, carried through Presence/Awareness/Guardian/Strategy/Communication alike). Converting a Creator\'s "Approved" response into an actual state change, plan execution, or publication remains entirely a Future Runtime concern, dependent on components this documentation-only Package does not build.',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const GOAL_COMMUNICATION_FLOW_DECLARATION = {
  everyChannelHasAFlowStep: true,
  everyStepNamesSourceCommunicationCreatorResponseReceiver: true,
  transportImplementationIntroduced: false,
  returnPathExecutionIntroduced: false,
  status: 'LIVING LAYER V, LAYER COMPONENT D, GOAL COMMUNICATION FLOW, complete. All 5 channels\' flows documented; no Receiving Layer granted any authority to act on a Creator response.',
} as const;

export const MAKMAN_GOAL_COMMUNICATION_FLOW = {
  steps: GOAL_COMMUNICATION_FLOW_STEPS,
  executionBoundaryNote: GOAL_COMMUNICATION_FLOW_EXECUTION_BOUNDARY_NOTE,
  declaration: GOAL_COMMUNICATION_FLOW_DECLARATION,
} as const;
