import type {
  ModelSelection,
  ModelSelectionResult,
  QualityTier,
  SovereignCreationIntent,
  SovereignMediaModelDescriptor,
} from './types';
import {
  IMAGE_RESOLUTION_RANK,
  QUALITY_TIER_RANK,
  VIDEO_RESOLUTION_RANK,
} from './types';
import type { SovereignModelRegistry } from './sovereign-model-registry';

/**
 * Cost lookup abstraction — decouples selector from AzmaUnitCostEngine implementation.
 * Returns the AZMA Unit cost or null when unavailable.
 */
export type CostLookupFn = (
  gatewayId: string,
  capabilityTarget: string,
  modelId?: string,
) => number | null;

/**
 * Health score abstraction — decouples selector from orchestrator telemetry.
 * Returns a score in [0, 1]; 0.75 is the "no telemetry" default.
 */
export type HealthScoreFn = (providerId: string) => number;

const DEFAULT_HEALTH_SCORE = 0.75;
// Models within this health delta are treated as ties; cost breaks the tie.
const HEALTH_TIE_THRESHOLD = 0.05;

/**
 * Sovereign Model Selector.
 *
 * Given a SovereignCreationIntent, selects the most appropriate model.
 *
 * Selection priority (Section IV of Construction Order):
 *   1. Creator requirements satisfied (hard filters — never silently bypassed)
 *   2. Actual model capability
 *   3. Required quality tier
 *   4. Required resolution
 *   5. Required duration (video)
 *   6. Required creative characteristics (preference, not hard filter)
 *   7. Availability (productionAuthorized)
 *   8. Provider/model health
 *   9. Cost optimization (tiebreaker only among quality-equivalent candidates)
 *
 * Cost NEVER causes a quality downgrade. A cheaper model that fails a quality
 * or resolution requirement is excluded before cost enters the evaluation.
 */
export class SovereignModelSelector {
  constructor(
    private readonly registry: SovereignModelRegistry,
    private readonly costLookup: CostLookupFn = () => null,
    private readonly healthScore: HealthScoreFn = () => DEFAULT_HEALTH_SCORE,
  ) {}

  select(intent: SovereignCreationIntent): ModelSelectionResult {
    // ── Step 1: production-authorized, active models for this media type ──────
    const authorized = this.registry.findProductionAuthorized(intent.mediaType);

    if (authorized.length === 0) {
      const allForType = this.registry.findByMediaType(intent.mediaType);
      if (allForType.length > 0) {
        return {
          selected: false,
          reason: 'all-candidates-unverified',
          detail:
            `No production-authorized model available for ${intent.mediaType} generation. ` +
            `${allForType.length} approved candidate(s) are registered and awaiting ` +
            `verification and Chief Architect production authorization.`,
        };
      }
      return {
        selected: false,
        reason: 'no-eligible-model',
        detail: `No model is registered for ${intent.mediaType} generation.`,
      };
    }

    // ── Step 2: filter by quality tier ────────────────────────────────────────
    const requiredTierRank = QUALITY_TIER_RANK[intent.qualityRequirement];
    const qualityEligible = authorized.filter(
      (m) => QUALITY_TIER_RANK[m.qualityTier] >= requiredTierRank,
    );

    if (qualityEligible.length === 0) {
      return {
        selected: false,
        reason: 'quality-unavailable',
        detail:
          `No authorized model satisfies the '${intent.qualityRequirement}' quality ` +
          `requirement for ${intent.mediaType} generation. ` +
          `Quality cannot be silently downgraded.`,
      };
    }

    // ── Step 3: filter by resolution ──────────────────────────────────────────
    const resolutionRank =
      intent.mediaType === 'image' ? IMAGE_RESOLUTION_RANK : VIDEO_RESOLUTION_RANK;
    const requiredRank = resolutionRank[intent.resolution] ?? 0;

    const resolutionEligible = qualityEligible.filter((m) => {
      const modelMaxRes =
        intent.mediaType === 'image' ? m.maxImageResolution : m.maxVideoResolution;
      if (!modelMaxRes) return true; // No declared cap — treat as capable
      return (resolutionRank[modelMaxRes] ?? 0) >= requiredRank;
    });

    if (resolutionEligible.length === 0) {
      return {
        selected: false,
        reason: 'resolution-unavailable',
        detail:
          `No authorized model supports '${intent.resolution}' for ${intent.mediaType} ` +
          `generation. Resolution cannot be silently downgraded.`,
      };
    }

    // ── Step 4: filter by duration (video only, hard requirement) ─────────────
    let durationEligible = resolutionEligible;
    if (intent.mediaType === 'video' && intent.durationSeconds !== undefined) {
      const withDuration = resolutionEligible.filter(
        (m) =>
          m.minDurationSeconds !== undefined &&
          m.maxDurationSeconds !== undefined &&
          intent.durationSeconds! >= m.minDurationSeconds &&
          intent.durationSeconds! <= m.maxDurationSeconds,
      );
      if (withDuration.length === 0) {
        return {
          selected: false,
          reason: 'duration-unavailable',
          detail:
            `No authorized model supports ${intent.durationSeconds}s video duration. ` +
            `Duration cannot be silently altered.`,
        };
      }
      durationEligible = withDuration;
    }

    // ── Step 4.5: filter by special characteristics (hard requirements) ─────────
    // Only hard-filters on boolean=true intent fields. Unknown capabilities
    // (undefined) are treated as NOT supported — AZMA never assumes unverified
    // capability (Section XIV of Construction Order).
    let characteristicsEligible = durationEligible;
    if (intent.characterConsistencyRequired === true) {
      const withCC = characteristicsEligible.filter(
        (m) => m.supportsCharacterConsistency === true,
      );
      if (withCC.length === 0) {
        return {
          selected: false,
          reason: 'capability-unavailable',
          detail:
            'No authorized model supports character consistency. ' +
            'The requirement cannot be silently dropped.',
        };
      }
      characteristicsEligible = withCC;
    }
    if (intent.audioRequired === true) {
      const withAudio = characteristicsEligible.filter(
        (m) => m.supportsAudio === true,
      );
      if (withAudio.length === 0) {
        return {
          selected: false,
          reason: 'capability-unavailable',
          detail:
            'No authorized model supports audio generation. ' +
            'The requirement cannot be silently dropped.',
        };
      }
      characteristicsEligible = withAudio;
    }

    // ── Step 5: prefer exact quality tier match (cost-efficiency preference) ──
    // Models that exactly match the required tier are preferred over over-qualified
    // models — prevents paying for unnecessary ultra quality when high suffices.
    // If no exact match, use the full eligible set (requirement is still satisfied).
    const exactTierPool = characteristicsEligible.filter(
      (m) => m.qualityTier === intent.qualityRequirement,
    );
    const scoringPool = exactTierPool.length > 0 ? exactTierPool : characteristicsEligible;

    // ── Step 6: score by provider health ──────────────────────────────────────
    const scored = scoringPool
      .map((model) => ({
        model,
        healthScore: this.healthScore(model.providerId),
      }))
      .sort((a, b) => b.healthScore - a.healthScore);

    // ── Step 7: cost tiebreaker among health-near-ties ────────────────────────
    // Only applies when two or more models are within HEALTH_TIE_THRESHOLD.
    // Cost never demotes a model that scored higher on health beyond the threshold.
    const topHealth = scored[0].healthScore;
    const nearTies = scored.filter(
      (c) => topHealth - c.healthScore <= HEALTH_TIE_THRESHOLD,
    );

    let bestModel = nearTies[0].model;
    if (nearTies.length > 1) {
      let lowestCost = Infinity;
      for (const candidate of nearTies) {
        const cost = this.costLookup(
          candidate.model.costCatalogKey.gatewayId,
          candidate.model.costCatalogKey.capabilityTarget,
          candidate.model.costCatalogKey.modelId,
        );
        if (cost !== null && cost < lowestCost) {
          lowestCost = cost;
          bestModel = candidate.model;
        }
      }
    }

    return {
      selected: true,
      selection: buildModelSelection(bestModel, intent),
    };
  }
}

function buildModelSelection(
  model: SovereignMediaModelDescriptor,
  intent: SovereignCreationIntent,
): ModelSelection {
  return {
    gatewayId: model.gatewayId,
    providerId: model.providerId,
    modelId: model.modelId,
    providerModelId: model.providerModelId,
    aspectRatio: intent.aspectRatio,
    resolution: intent.resolution,
    qualityTier: model.qualityTier,
    verificationStatus: model.verificationStatus,
    ...(intent.durationSeconds !== undefined ? { durationSeconds: intent.durationSeconds } : {}),
  };
}
