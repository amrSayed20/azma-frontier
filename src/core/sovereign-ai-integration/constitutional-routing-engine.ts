import { ConstitutionActionContext, ConstitutionRuntime } from '../constitution-runtime';
import { ModelRegistry } from './model-registry';
import { AIProviderAdapter, AIRoutingDecision, SovereignAIRequest } from './provider-contracts';

export class ConstitutionalRoutingEngine {
  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime,
    private readonly modelRegistry: ModelRegistry
  ) {}

  public route(request: SovereignAIRequest, candidates: readonly AIProviderAdapter[]): AIRoutingDecision {
    const actionContext = this.createActionContext(request);
    const evaluation = this.constitutionRuntime.evaluate(actionContext);
    const selectedProvider = candidates[0];
    const selectedModel = selectedProvider
      ? this.modelRegistry.findByCapability(selectedProvider.descriptor.providerId, request.capability)
      : undefined;

    return {
      routingId: `ai-route-${Date.now().toString(36)}`,
      requestId: request.requestId,
      allowed: evaluation.decision !== 'deny' && Boolean(selectedProvider && selectedModel),
      selectedProviderId: selectedProvider?.descriptor.providerId,
      selectedModelId: selectedModel?.modelId,
      fallbackProviderIds: candidates.slice(1).map((provider) => provider.descriptor.providerId),
      explanation: this.explain(request, selectedProvider?.descriptor.providerId, selectedModel?.modelId, evaluation.reasons),
      constitutionalEvaluation: evaluation,
      actionContext,
    };
  }

  private createActionContext(request: SovereignAIRequest): ConstitutionActionContext {
    return {
      actionId: `ai-action-${request.requestId}`,
      actionType: 'provider-management',
      title: 'Sovereign AI Provider Routing',
      description: request.purpose,
      targetModule: 'al-wateen',
      requestedBy: request.requestedBy,
      requestedAt: request.requestedAt,
      scope: 'provider-management',
      priority: request.priority,
      payload: {
        capability: request.capability,
        preferredModelId: request.preferredModelId,
        preferredProviderId: request.preferredProviderId,
      },
      metadata: request.context.metadata,
    };
  }

  private explain(
    request: SovereignAIRequest,
    providerId: string | undefined,
    modelId: string | undefined,
    reasons: readonly string[]
  ): string {
    const selected = providerId && modelId ? `${providerId}/${modelId}` : 'no eligible provider';
    return `DNA routed ${request.capability} through constitutional policy to ${selected}. ${reasons[0] ?? 'No additional constitutional reason published.'}`;
  }
}
