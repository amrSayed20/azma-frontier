import {
  AICapabilityType,
  AIModelDescriptor,
  AIProviderDescriptor,
  AIProviderTelemetry,
  AIRequestPriority,
  NormalizedAIResponse,
} from '../sovereign-ai-integration';

export type DNATaskType =
  | 'image'
  | 'video'
  | 'audio'
  | 'code'
  | 'reasoning'
  | 'search'
  | 'translation'
  | 'editing'
  | 'summarization'
  | 'data-analysis'
  | 'conversation'
  | 'embedding'
  | 'vision'
  | 'tool-use';

export type DNAModality = 'text' | 'image' | 'video' | 'audio' | 'code' | 'multimodal';

export interface DNAOrchestrationRequest {
  readonly requestId: string;
  readonly requestedAt?: Date;
  readonly requestedBy: string;
  readonly prompt: string;
  readonly purpose?: string;
  readonly priority?: AIRequestPriority;
  readonly taskHint?: DNATaskType;
  readonly modalityHint?: DNAModality;
  readonly sessionId?: string;
  readonly founderId?: string;
  readonly chamberId?: string;
  readonly memoryRefs?: readonly string[];
  readonly maxOutputTokens?: number;
  readonly providerPriorityFamilies?: readonly string[];
  readonly preferredProviderId?: string;
  readonly preferredModelId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface DNATaskClassification {
  readonly taskType: DNATaskType;
  readonly modality: DNAModality;
  readonly capability: AICapabilityType;
  readonly confidence: number;
  readonly explanation: string;
}

export interface DNARequestAnalysis {
  readonly requestId: string;
  readonly promptLength: number;
  readonly priority: AIRequestPriority;
  readonly classification: DNATaskClassification;
  readonly requiresFreshContext: boolean;
  readonly requiresToolUse: boolean;
  readonly requiresMultimodalProvider: boolean;
  readonly explanation: string;
}

export interface DNAProviderScore {
  readonly providerId: string;
  readonly modelId?: string;
  readonly score: number;
  readonly healthScore: number;
  readonly priorityScore: number;
  readonly capabilityScore: number;
  readonly explanation: string;
}

export interface DNAProviderSelection {
  readonly selectedProviderId?: string;
  readonly selectedModelId?: string;
  readonly fallbackProviderIds: readonly string[];
  readonly scores: readonly DNAProviderScore[];
  readonly explanation: string;
}

export interface DNAOrchestrationTelemetry {
  readonly requestId: string;
  readonly taskType: DNATaskType;
  readonly capability: AICapabilityType;
  readonly selectedProviderId?: string;
  readonly selectedModelId?: string;
  readonly fallbackCount: number;
  readonly latencyMs: number;
  readonly costEstimate: number;
  readonly finishReason: string;
  readonly recordedAt: Date;
}

export interface DNAOrchestrationRecord {
  readonly request: DNAOrchestrationRequest;
  readonly analysis: DNARequestAnalysis;
  readonly selection: DNAProviderSelection;
  readonly response: NormalizedAIResponse;
  readonly telemetry: DNAOrchestrationTelemetry;
  readonly immutable: true;
}

export interface DNAOrchestrationResult {
  readonly requestId: string;
  readonly analysis: DNARequestAnalysis;
  readonly selection: DNAProviderSelection;
  readonly response: NormalizedAIResponse;
  readonly telemetry: DNAOrchestrationTelemetry;
  readonly immutable: true;
}

export interface DNAProviderInventory {
  readonly providers: readonly AIProviderDescriptor[];
  readonly models: readonly AIModelDescriptor[];
  readonly health: readonly AIProviderTelemetry[];
}

export interface DNAOrchestratorSnapshot {
  readonly totalRequests: number;
  readonly totalCompleted: number;
  readonly totalBlocked: number;
  readonly totalFailed: number;
  readonly lastRequestId?: string;
  readonly lastTaskType?: DNATaskType;
  readonly lastProviderId?: string;
  readonly lastUpdatedAt?: Date;
}
