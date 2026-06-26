import { CostAnalyzer } from './cost-analyzer';
import {
  AIRoutingDecision,
  AIProviderDescriptor,
  NormalizedAIResponse,
  RawAIProviderResponse,
  SovereignAIRequest,
} from './provider-contracts';

export class ResponseNormalizer {
  constructor(private readonly costAnalyzer: CostAnalyzer) {}

  public normalize(
    request: SovereignAIRequest,
    routing: AIRoutingDecision,
    response: RawAIProviderResponse,
    provider: AIProviderDescriptor | undefined
  ): NormalizedAIResponse {
    return {
      responseId: `ai-response-${Date.now().toString(36)}`,
      requestId: request.requestId,
      providerId: response.providerId,
      modelId: response.modelId,
      content: response.content,
      finishReason: response.finishReason,
      constitutionalExplanation: routing.constitutionalEvaluation.reasons.join(' ') || 'Constitutional route completed.',
      routingExplanation: routing.explanation,
      inputTokens: response.inputTokens,
      outputTokens: response.outputTokens,
      latencyMs: response.latencyMs,
      costEstimate: this.costAnalyzer.estimateResponse(provider, response),
      generatedAt: new Date(),
      immutable: true,
    };
  }

  public blocked(request: SovereignAIRequest, routing: AIRoutingDecision, content: string): NormalizedAIResponse {
    return {
      responseId: `ai-response-${Date.now().toString(36)}`,
      requestId: request.requestId,
      content,
      finishReason: 'blocked',
      constitutionalExplanation: routing.constitutionalEvaluation.reasons.join(' ') || 'Constitutional route blocked execution.',
      routingExplanation: routing.explanation,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: 0,
      costEstimate: 0,
      generatedAt: new Date(),
      immutable: true,
    };
  }
}
