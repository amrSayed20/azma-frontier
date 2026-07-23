/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * OPERATIONAL FOUNDATION — RECOMMENDATION & NOTIFICATION OPERATIONAL SYSTEM
 * (WORK PACKAGE C: DELIVERY SYSTEM)
 * (Construction ID MAG-OPF-002)
 *
 * The one executable file in this Package. Receives already-constructed
 * Recommendation/Notification content, validates its constitutional
 * integrity was preserved (never alters a field), and holds it — nothing
 * more. No transport, no external call, no reasoning, no coupling to
 * Runtime Core or goal-state.ts.
 */

import type { RasAlAmrGoalStrategyRecommendation } from './GOAL_STRATEGY_RECOMMENDATION';
import type {
  GoalNotification,
  RuntimeChainContext,
  DeliveryChannel,
  RasAlAmrMakmanDeliveryRecord,
} from './MAKMAN_OPERATIONAL_DELIVERY_CONTRACTS';

export class MakmanDeliveryIntegrityError extends Error {
  constructor(channel: DeliveryChannel, reason: string) {
    super(`Delivery integrity violation on [${channel}]: ${reason}`);
    this.name = 'MakmanDeliveryIntegrityError';
  }
}

let deliveryCounter = 0;
function generateDeliveryId(prefix: string): string {
  deliveryCounter += 1;
  return `${prefix}-${Date.now()}-${deliveryCounter}`;
}

/**
 * Receives, validates, and holds Recommendation/Notification content
 * exactly as produced — reinterprets nothing, executes nothing, never
 * touches Goal Commitment.
 */
export class MakmanDeliverySystem {
  private readonly deliveries = new Map<string, RasAlAmrMakmanDeliveryRecord<unknown>>();

  /** Receives a Strategy-produced Recommendation (GOAL_STRATEGY_RECOMMENDATION.ts's shape, unaltered). */
  public receiveRecommendation(
    recommendation: RasAlAmrGoalStrategyRecommendation,
    chainContext: RuntimeChainContext
  ): RasAlAmrMakmanDeliveryRecord<RasAlAmrGoalStrategyRecommendation> {
    if (!recommendation.preservesCreatorAuthority || recommendation.isExecutable || recommendation.destination !== 'the-creator') {
      throw new MakmanDeliveryIntegrityError(
        'Recommendation Delivery',
        'recommendation must preserve Creator Authority, must not be executable, and must be addressed to the Creator.'
      );
    }

    const record: RasAlAmrMakmanDeliveryRecord<RasAlAmrGoalStrategyRecommendation> = {
      deliveryId: generateDeliveryId('recommendation'),
      channel: 'Recommendation Delivery',
      content: recommendation,
      chainContext,
      status: 'ready-for-creator',
      receivedAtMs: Date.now(),
    };

    this.deliveries.set(record.deliveryId, record);
    return record;
  }

  /** Receives an Awareness-classification-change-derived Notification (this Package's own GoalNotification shape, unaltered). */
  public receiveNotification(
    notification: GoalNotification,
    chainContext: RuntimeChainContext
  ): RasAlAmrMakmanDeliveryRecord<GoalNotification> {
    if (notification.isExecutable || notification.destination !== 'the-creator') {
      throw new MakmanDeliveryIntegrityError(
        'Notification Delivery',
        'notification must not be executable and must be addressed to the Creator.'
      );
    }

    const record: RasAlAmrMakmanDeliveryRecord<GoalNotification> = {
      deliveryId: generateDeliveryId('notification'),
      channel: 'Notification Delivery',
      content: notification,
      chainContext,
      status: 'ready-for-creator',
      receivedAtMs: Date.now(),
    };

    this.deliveries.set(record.deliveryId, record);
    return record;
  }

  public getDelivery(deliveryId: string): RasAlAmrMakmanDeliveryRecord<unknown> | undefined {
    return this.deliveries.get(deliveryId);
  }

  public getAllDeliveries(): readonly RasAlAmrMakmanDeliveryRecord<unknown>[] {
    return Array.from(this.deliveries.values());
  }

  public size(): number {
    return this.deliveries.size;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DECLARATION
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_OPERATIONAL_DELIVERY_SYSTEM_DECLARATION = {
  contentReinterpreted: false,
  runtimeCoreImported: false,
  goalStateImported: false,
  transportImplemented: false,
  status: 'OPERATIONAL FOUNDATION (MAG-OPF-002), WORK PACKAGE C, DELIVERY SYSTEM, complete. One executable class; receive-validate-hold only.',
} as const;
