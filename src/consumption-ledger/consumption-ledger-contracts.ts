/**
 * AZMA OS — CONSUMPTION LEDGER
 * Domain Contracts
 *
 * Declares the three types this ledger tracks, the per-creator monthly
 * usage shape, and the constitutional interface the persistent-storage
 * layer implements. Declared here (not in persistent-storage) so the
 * domain owns the contract — the same inversion-of-dependency pattern
 * as ICinematicLedger and IGoalRepository.
 *
 * WHAT THIS LEDGER IS:
 *   A durable, internal record of every AI provider call the platform
 *   makes on behalf of a Creator — used exclusively for cost discovery
 *   during the Founder Beta phase. No cost data is ever surfaced to
 *   Creators; it is a Founder-only instrument.
 *
 * WHAT THIS LEDGER IS NOT:
 *   - Not a billing system (Stripe owns billing)
 *   - Not a rate-limiter (the existing rate-limiter is separate)
 *   - Not an analytics product (no Creator-facing dashboard)
 *   - Not a subscription decision layer (SOEL owns entitlement)
 */

export enum OperationType {
  IMAGE_GENERATION = 'image-generation',
  TEXT_TO_SPEECH   = 'text-to-speech',
  VOICE_CLONE      = 'voice-clone',
}

export interface ConsumptionRecord {
  readonly creatorId: string;
  readonly operationType: OperationType;
  /** Estimated cost in USD at the time of the call, based on published provider pricing. */
  readonly costUsdEstimate: number;
  /**
   * Provider-meaningful unit count:
   *   image-generation → 1 per image
   *   text-to-speech   → character count of the submitted text
   *   voice-clone      → 1 per clone operation
   */
  readonly units: number;
  /** 'YYYY-MM' — groups records for monthly aggregation without a date function on every query. */
  readonly monthKey: string;
  readonly recordedAt: number;
}

/** Aggregated monthly usage for a single Creator. */
export interface MonthlyUsage {
  readonly imageGenerations: number;
  readonly ttsCharacters: number;
  readonly voiceClones: number;
  readonly totalCostUsdEstimate: number;
}

/** Per-Creator usage row for the Founder dashboard. */
export interface CreatorMonthlyUsage extends MonthlyUsage {
  readonly creatorId: string;
}

/**
 * Constitutional interface for the consumption ledger.
 * Implemented by ConsumptionRepository in persistent-storage.
 */
export interface IConsumptionLedger {
  record(record: ConsumptionRecord): void;
  getMonthlyUsage(creatorId: string, monthKey: string): MonthlyUsage;
  getAllCreatorsUsage(monthKey: string): readonly CreatorMonthlyUsage[];
}
