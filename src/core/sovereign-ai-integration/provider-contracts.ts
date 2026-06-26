import { ConstitutionActionContext, ConstitutionEvaluationResult } from '../constitution-runtime';

export type AICapabilityType =
  | 'text-generation'
  | 'chat-completion'
  | 'embedding'
  | 'image-generation'
  | 'image-editing'
  | 'audio-transcription'
  | 'audio-generation'
  | 'vision-analysis'
  | 'tool-use'
  | 'reasoning';

export type AIProviderStatus = 'available' | 'degraded' | 'unavailable';
export type AIRequestPriority = 'low' | 'normal' | 'high' | 'critical' | 'constitutional';
export type AIResponseFinishReason = 'completed' | 'blocked' | 'failed' | 'fallback-exhausted';

export interface AICapabilityDescriptor {
  readonly capabilityId: string;
  readonly type: AICapabilityType;
  readonly description: string;
  readonly constitutionalScopes: readonly string[];
}

export interface AIModelDescriptor {
  readonly modelId: string;
  readonly providerId: string;
  readonly displayName: string;
  readonly capabilities: readonly AICapabilityType[];
  readonly contextWindow: number;
  readonly maxOutputTokens: number;
  readonly active: boolean;
}

export interface AIProviderCostProfile {
  readonly inputUnitCost: number;
  readonly outputUnitCost: number;
  readonly currency: string;
}

export interface AIProviderDescriptor {
  readonly providerId: string;
  readonly displayName: string;
  readonly providerFamily: string;
  readonly capabilities: readonly AICapabilityType[];
  readonly modelIds: readonly string[];
  readonly maxConcurrentRequests: number;
  readonly costProfile: AIProviderCostProfile;
  readonly sovereign: true;
}

export interface AIProviderTelemetry {
  readonly providerId: string;
  readonly status: AIProviderStatus;
  readonly activeRequests: number;
  readonly successRate: number;
  readonly averageLatencyMs: number;
  readonly availabilityScore: number;
  readonly lastCheckedAt: Date;
}

export interface AIRequestContext {
  readonly founderId?: string;
  readonly sessionId?: string;
  readonly chamberId?: string;
  readonly memoryRefs: readonly string[];
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface SovereignAIRequest {
  readonly requestId: string;
  readonly requestedAt: Date;
  readonly requestedBy: string;
  readonly purpose: string;
  readonly prompt: string;
  readonly capability: AICapabilityType;
  readonly priority: AIRequestPriority;
  readonly context: AIRequestContext;
  readonly maxOutputTokens?: number;
  readonly preferredModelId?: string;
  readonly preferredProviderId?: string;
}

export interface BuiltAIContext {
  readonly requestId: string;
  readonly prompt: string;
  readonly systemContext: string;
  readonly memoryContext: readonly string[];
  readonly constitutionalContext: string;
}

export interface AIRoutingDecision {
  readonly routingId: string;
  readonly requestId: string;
  readonly allowed: boolean;
  readonly selectedProviderId?: string;
  readonly selectedModelId?: string;
  readonly fallbackProviderIds: readonly string[];
  readonly explanation: string;
  readonly constitutionalEvaluation: ConstitutionEvaluationResult;
  readonly actionContext: ConstitutionActionContext;
}

export interface AIProviderDispatchInput {
  readonly request: SovereignAIRequest;
  readonly context: BuiltAIContext;
  readonly routing: AIRoutingDecision;
}

export interface RawAIProviderResponse {
  readonly providerId: string;
  readonly modelId: string;
  readonly content: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly latencyMs: number;
  readonly finishReason: AIResponseFinishReason;
  readonly metadata: Readonly<Record<string, unknown>>;
}

export interface NormalizedAIResponse {
  readonly responseId: string;
  readonly requestId: string;
  readonly providerId?: string;
  readonly modelId?: string;
  readonly content: string;
  readonly finishReason: AIResponseFinishReason;
  readonly constitutionalExplanation: string;
  readonly routingExplanation: string;
  readonly inputTokens: number;
  readonly outputTokens: number;
  readonly latencyMs: number;
  readonly costEstimate: number;
  readonly generatedAt: Date;
  readonly immutable: true;
}

export interface AIProviderAdapter {
  readonly descriptor: AIProviderDescriptor;
  dispatch(input: AIProviderDispatchInput): Promise<RawAIProviderResponse>;
}

export interface AIExecutionRecord {
  readonly request: SovereignAIRequest;
  readonly routing: AIRoutingDecision;
  readonly response: NormalizedAIResponse;
}
