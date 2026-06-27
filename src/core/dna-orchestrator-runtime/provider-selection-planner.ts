import { AIModelDescriptor } from '../sovereign-ai-integration';
import {
  DNAProviderInventory,
  DNAProviderScore,
  DNAProviderSelection,
  DNARequestAnalysis,
  DNAOrchestrationRequest,
} from './dna-orchestrator-types';
import { ProviderHealthScoringEngine } from './provider-health-scoring-engine';
import { ProviderPriorityEngine } from './provider-priority-engine';

export class ProviderSelectionPlanner {
  constructor(
    private readonly healthScoringEngine: ProviderHealthScoringEngine,
    private readonly priorityEngine: ProviderPriorityEngine
  ) {}

  public plan(
    request: DNAOrchestrationRequest,
    analysis: DNARequestAnalysis,
    inventory: DNAProviderInventory
  ): DNAProviderSelection {
    const scores = inventory.providers
      .map((provider): DNAProviderScore | undefined => {
        const model = this.findModel(provider.providerId, analysis, inventory.models, request.preferredModelId);
        const telemetry = inventory.health.find((value) => value.providerId === provider.providerId);

        if (!provider.capabilities.includes(analysis.classification.capability) || !model) {
          return undefined;
        }

        const healthScore = this.healthScoringEngine.score(telemetry);
        const priorityScore =
          request.preferredProviderId === provider.providerId
            ? 1
            : this.priorityEngine.score(provider, request.providerPriorityFamilies);
        const capabilityScore = model.capabilities.includes(analysis.classification.capability) ? 1 : 0;
        const score = healthScore * 0.45 + priorityScore * 0.3 + capabilityScore * 0.25;

        return {
          providerId: provider.providerId,
          modelId: model.modelId,
          score,
          healthScore,
          priorityScore,
          capabilityScore,
          explanation: `Provider scored for ${analysis.classification.capability} with health ${healthScore.toFixed(2)} and priority ${priorityScore.toFixed(2)}.`,
        };
      })
      .filter((score): score is DNAProviderScore => Boolean(score))
      .sort((a, b) => b.score - a.score);

    return {
      selectedProviderId: scores[0]?.providerId,
      selectedModelId: scores[0]?.modelId,
      fallbackProviderIds: scores.slice(1).map((score) => score.providerId),
      scores,
      explanation: scores[0]
        ? `DNA selected ${scores[0].providerId}/${scores[0].modelId} with ${scores.length - 1} fallback route(s).`
        : 'DNA found no eligible provider route; constitutional AI integration will return a governed blocked response.',
    };
  }

  private findModel(
    providerId: string,
    analysis: DNARequestAnalysis,
    models: readonly AIModelDescriptor[],
    preferredModelId: string | undefined
  ): AIModelDescriptor | undefined {
    const providerModels = models.filter(
      (model) => model.providerId === providerId && model.active && model.capabilities.includes(analysis.classification.capability)
    );

    return providerModels.find((model) => model.modelId === preferredModelId) ?? providerModels[0];
  }
}
