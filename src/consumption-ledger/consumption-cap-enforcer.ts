/**
 * AZMA OS — CONSUMPTION LEDGER
 * Consumption Cap Enforcer
 *
 * Pure function — takes a MonthlyUsage snapshot and the operation being
 * attempted, returns whether the call is allowed. No database access, no
 * side effects. The route layer reads the current usage from the ledger,
 * then calls this function before forwarding to the provider.
 *
 * BETA CAP RATIONALE:
 *   The Founder Beta phase is a cost-discovery exercise, not a revenue
 *   source. Caps are set low enough that a single rogue creator cannot
 *   produce a meaningful bill, but high enough for realistic testing:
 *     20 images  × $0.040 = $0.80 max image exposure / creator / month
 *     50 000 chars × $0.015/1K = $0.75 max TTS exposure / creator / month
 *     3 clones   × $0.300 = $0.90 max clone exposure / creator / month
 *   Worst-case total: ~$2.45 / creator / month before caps fire.
 *
 * FOUNDER EXEMPTION:
 *   Founders are never subject to caps — the route layer gates this
 *   function behind `session.role !== 'founder'`, matching the existing
 *   billing entitlement exemption pattern (hasActiveEntitlement).
 */

import type { MonthlyUsage } from './consumption-ledger-contracts';
import { OperationType } from './consumption-ledger-contracts';

export interface UsageCap {
  readonly imageGenerations: number;
  readonly ttsCharacters: number;
  readonly voiceClones: number;
}

export interface CapCheckResult {
  readonly allowed: boolean;
  readonly reason?: string;
}

/** The single hardcoded cap for the Founder Beta phase. */
export const BETA_USAGE_CAP: UsageCap = {
  imageGenerations: 20,
  ttsCharacters:    50_000,
  voiceClones:      3,
};

/**
 * Checks whether a proposed operation fits within the current monthly cap.
 * @param usage    Current aggregated usage for the creator this month.
 * @param cap      The cap to enforce (usually BETA_USAGE_CAP).
 * @param type     The operation about to be performed.
 * @param units    Units the operation will consume (1 for image/clone, char count for TTS).
 */
export function checkConsumptionCap(
  usage: MonthlyUsage,
  cap: UsageCap,
  type: OperationType,
  units: number,
): CapCheckResult {
  switch (type) {
    case OperationType.IMAGE_GENERATION:
      if (usage.imageGenerations + units > cap.imageGenerations) {
        return {
          allowed: false,
          reason: `Monthly image generation limit reached (${cap.imageGenerations} images per month during the Founder Beta).`,
        };
      }
      break;

    case OperationType.TEXT_TO_SPEECH:
      if (usage.ttsCharacters + units > cap.ttsCharacters) {
        return {
          allowed: false,
          reason: `Monthly speech generation limit reached (${(cap.ttsCharacters / 1000).toFixed(0)} 000 characters per month during the Founder Beta).`,
        };
      }
      break;

    case OperationType.VOICE_CLONE:
      if (usage.voiceClones + units > cap.voiceClones) {
        return {
          allowed: false,
          reason: `Monthly voice clone limit reached (${cap.voiceClones} clones per month during the Founder Beta).`,
        };
      }
      break;
  }

  return { allowed: true };
}
