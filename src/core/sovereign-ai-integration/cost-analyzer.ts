import { AIProviderDescriptor, RawAIProviderResponse, SovereignAIRequest } from './provider-contracts';

export class CostAnalyzer {
  public estimateRequest(provider: AIProviderDescriptor, request: SovereignAIRequest): number {
    const estimatedInputTokens = Math.max(1, Math.ceil(request.prompt.length / 4));
    const estimatedOutputTokens = request.maxOutputTokens ?? 1024;

    return estimatedInputTokens * provider.costProfile.inputUnitCost + estimatedOutputTokens * provider.costProfile.outputUnitCost;
  }

  public estimateResponse(provider: AIProviderDescriptor | undefined, response: RawAIProviderResponse): number {
    if (!provider) {
      return 0;
    }

    return response.inputTokens * provider.costProfile.inputUnitCost + response.outputTokens * provider.costProfile.outputUnitCost;
  }

  public score(provider: AIProviderDescriptor, request: SovereignAIRequest): number {
    return 1 / (1 + this.estimateRequest(provider, request));
  }
}
