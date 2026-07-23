/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * OPERATIONAL FOUNDATION — MAKMAN RUNTIME CORE (WORK PACKAGE D: ORCHESTRATION)
 * (Construction ID MAG-OPF-001)
 *
 * The single executable file in this Package. Everything it does is
 * sequencing and identity-wiring, per MAKMAN_RUNTIME_CORE_LIFECYCLE.ts's
 * already-derived stage order — it re-implements none of any Living
 * Layer's actual reasoning. It never constructs a GoalPresenceContext,
 * GoalAwarenessClassification, GoalGuardianProtection finding, Strategy
 * analysis, or Communication channel content — those remain exactly what
 * they were: certified, declarative architecture, not running code. The
 * only real effect this file can produce on the outside world is, at the
 * Goal Commitment stage, an already-Creator-authorized call into
 * goal-state.ts (MAG-CIC-001).
 */

import type { GoalContract } from './goal-contracts';
import { GoalState, type CreatorAuthorizationDecision } from './goal-state';
import type { GoalPresenceIdentity } from './GOAL_PRESENCE_IDENTITY';
import type { GoalAwarenessIdentity } from './GOAL_AWARENESS_IDENTITY';
import type { GoalGuardianIdentity } from './GOAL_GUARDIAN_IDENTITY';
import type { GoalStrategyIdentity } from './GOAL_STRATEGY_IDENTITY';
import type { GoalCommunicationIdentity } from './GOAL_COMMUNICATION_IDENTITY';
import type { MakmanRuntimeCoreLifecycleStage } from './MAKMAN_RUNTIME_CORE_LIFECYCLE';

export class MakmanRuntimeSequenceError extends Error {
  constructor(expectedStage: MakmanRuntimeCoreLifecycleStage, actualStage: MakmanRuntimeCoreLifecycleStage) {
    super(`Runtime Core sequence violation: expected stage [${expectedStage}], but Runtime is at [${actualStage}]. Goal Commitment may never be bypassed and no stage may be skipped.`);
    this.name = 'MakmanRuntimeSequenceError';
  }
}

let sequenceCounter = 0;
function generateLayerId(prefix: string): string {
  sequenceCounter += 1;
  return `${prefix}-${Date.now()}-${sequenceCounter}`;
}

/**
 * Threads Presence → Awareness → Guardian → Strategy → Communication →
 * Goal Commitment together for exactly one Goal, per
 * MAKMAN_RUNTIME_CORE_LIFECYCLE.ts's derived ordering. Holds no Goal
 * reasoning of its own.
 */
export class MakmanGoalRuntime {
  private readonly goalState: GoalState;
  private stage: MakmanRuntimeCoreLifecycleStage = 'Goal Handover';

  private presence: GoalPresenceIdentity | null = null;
  private awareness: GoalAwarenessIdentity | null = null;
  private guardian: GoalGuardianIdentity | null = null;
  private strategy: GoalStrategyIdentity | null = null;
  private communication: GoalCommunicationIdentity | null = null;

  constructor(goalState: GoalState) {
    this.goalState = goalState;
  }

  public get currentStage(): MakmanRuntimeCoreLifecycleStage {
    return this.stage;
  }

  /** Stage 1 — Goal Handover. Delegates entirely to the already-existing, ungated register(). */
  public handoverGoal(goal: GoalContract): void {
    if (this.stage !== 'Goal Handover') {
      throw new MakmanRuntimeSequenceError('Goal Handover', this.stage);
    }
    this.goalState.register(goal);
    this.stage = 'Presence Instantiation';
  }

  /** Stage 2 — Presence Instantiation. Produces only the identity shape GOAL_PRESENCE_IDENTITY.ts declares. */
  public instantiatePresence(goalId: GoalContract['goalId']): GoalPresenceIdentity {
    if (this.stage !== 'Presence Instantiation') {
      throw new MakmanRuntimeSequenceError('Presence Instantiation', this.stage);
    }
    this.presence = { goalId, presenceId: generateLayerId('presence') };
    this.stage = 'Awareness Instantiation';
    return this.presence;
  }

  /** Stage 3 — Awareness Instantiation. Produces only the identity shape GOAL_AWARENESS_IDENTITY.ts declares. */
  public instantiateAwareness(): GoalAwarenessIdentity {
    if (this.stage !== 'Awareness Instantiation' || !this.presence) {
      throw new MakmanRuntimeSequenceError('Awareness Instantiation', this.stage);
    }
    this.awareness = { presenceId: this.presence.presenceId, awarenessId: generateLayerId('awareness') };
    this.stage = 'Guardian Instantiation';
    return this.awareness;
  }

  /** Stage 4 — Guardian Instantiation. Produces only the identity shape GOAL_GUARDIAN_IDENTITY.ts declares. */
  public instantiateGuardian(): GoalGuardianIdentity {
    if (this.stage !== 'Guardian Instantiation' || !this.awareness) {
      throw new MakmanRuntimeSequenceError('Guardian Instantiation', this.stage);
    }
    this.guardian = { awarenessId: this.awareness.awarenessId, guardianId: generateLayerId('guardian') };
    this.stage = 'Strategy Instantiation';
    return this.guardian;
  }

  /** Stage 5 — Strategy Instantiation. Produces only the identity shape GOAL_STRATEGY_IDENTITY.ts declares. */
  public instantiateStrategy(): GoalStrategyIdentity {
    if (this.stage !== 'Strategy Instantiation' || !this.guardian) {
      throw new MakmanRuntimeSequenceError('Strategy Instantiation', this.stage);
    }
    this.strategy = { guardianId: this.guardian.guardianId, strategyId: generateLayerId('strategy') };
    this.stage = 'Communication Instantiation';
    return this.strategy;
  }

  /** Stage 6 — Communication Instantiation. Produces only the identity shape GOAL_COMMUNICATION_IDENTITY.ts declares. */
  public instantiateCommunication(): GoalCommunicationIdentity {
    if (this.stage !== 'Communication Instantiation' || !this.strategy) {
      throw new MakmanRuntimeSequenceError('Communication Instantiation', this.stage);
    }
    this.communication = { strategyId: this.strategy.strategyId, communicationId: generateLayerId('communication') };
    this.stage = 'Goal Commitment';
    return this.communication;
  }

  /**
   * Stage 7 — Goal Commitment. The only method in this Package permitted
   * to cause an effective mutation, and only by passing an already-produced
   * CreatorAuthorizationDecision through to goal-state.ts unchanged. See
   * MAKMAN_RUNTIME_CORE_GOAL_COMMITMENT.ts.
   */
  public commitGoal(
    operation: 'update' | 'remove',
    goal: GoalContract,
    authorization: CreatorAuthorizationDecision
  ): void {
    if (this.stage !== 'Goal Commitment' || !this.communication) {
      throw new MakmanRuntimeSequenceError('Goal Commitment', this.stage);
    }

    if (operation === 'update') {
      this.goalState.update(goal, authorization);
    } else {
      this.goalState.remove(goal.goalId, authorization);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_RUNTIME_CORE_ORCHESTRATION_DECLARATION = {
  livingLayerReasoningReimplemented: false,
  onlyIdentityWiringPerformed: true,
  onlyMutationPathIsGoalCommitment: true,
  infrastructureIntroduced: false,
  status: 'OPERATIONAL FOUNDATION, WORK PACKAGE D, RUNTIME ORCHESTRATION, complete. One executable class; sequencing and identity-wiring only.',
} as const;
