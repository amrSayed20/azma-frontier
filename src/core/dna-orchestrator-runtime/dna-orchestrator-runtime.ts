import {
  AIProviderAdapter,
  SovereignAIIntegrationApi,
  SovereignAIRequest,
} from '../sovereign-ai-integration';
import {
  DNAOrchestrationRequest,
  DNAOrchestrationResult,
  DNAProviderInventory,
} from './dna-orchestrator-types';
import { DNAOrchestratorRuntimeState } from './runtime-state';
import { OrchestrationHistory } from './orchestration-history';
import { OrchestrationTelemetry } from './orchestration-telemetry';
import { ProviderSelectionPlanner } from './provider-selection-planner';
import { RequestAnalyzer } from './request-analyzer';

export class DNAOrchestratorRuntime {
  constructor(
    private readonly aiIntegrationApi: SovereignAIIntegrationApi,
    private readonly requestAnalyzer: RequestAnalyzer,
    private readonly providerSelectionPlanner: ProviderSelectionPlanner,
    private readonly history: OrchestrationHistory,
    private readonly telemetry: OrchestrationTelemetry,
    private readonly state: DNAOrchestratorRuntimeState
  ) {}

  public registerProvider(provider: AIProviderAdapter): void {
    this.aiIntegrationApi.registerProvider(provider);
  }

  public async orchestrate(request: DNAOrchestrationRequest): Promise<DNAOrchestrationResult> {
    const startedAt = Date.now();
    const analysis = this.requestAnalyzer.analyze(request);
    const selection = this.providerSelectionPlanner.plan(request, analysis, this.inventory());
    const sovereignRequest = this.toSovereignRequest(request, analysis.classification.capability, selection.selectedProviderId, selection.selectedModelId);
    const response = await this.aiIntegrationApi.execute(sovereignRequest);
    const telemetry = this.telemetry.build(request, analysis, selection, response, startedAt);
    const result: DNAOrchestrationResult = {
      requestId: request.requestId,
      analysis,
      selection,
      response,
      telemetry,
      immutable: true,
    };

    this.history.record({
      request,
      analysis,
      selection,
      response,
      telemetry,
      immutable: true,
    });
    this.state.record(telemetry);

    return result;
  }

  public inventory(): DNAProviderInventory {
    return {
      providers: this.aiIntegrationApi.providers(),
      models: this.aiIntegrationApi.models(),
      health: this.aiIntegrationApi.health(),
    };
  }

  public recentHistory(limit: number = 20) {
    return this.history.recent(limit);
  }

  public recentTelemetry(limit: number = 20) {
    return this.telemetry.recent(limit);
  }

  public snapshot() {
    return this.state.snapshot();
  }

  private toSovereignRequest(
    request: DNAOrchestrationRequest,
    capability: SovereignAIRequest['capability'],
    selectedProviderId: string | undefined,
    selectedModelId: string | undefined
  ): SovereignAIRequest {
    return {
      requestId: request.requestId,
      requestedAt: request.requestedAt ?? new Date(),
      requestedBy: request.requestedBy,
      purpose: request.purpose ?? 'DNA Orchestrator sovereign AI request',
      prompt: request.prompt,
      capability,
      priority: request.priority ?? 'normal',
      context: {
        founderId: request.founderId,
        sessionId: request.sessionId,
        chamberId: request.chamberId,
        memoryRefs: request.memoryRefs ?? [],
        metadata: {
          ...(request.metadata ?? {}),
          dnaTaskHint: request.taskHint,
          dnaModalityHint: request.modalityHint,
        },
      },
      maxOutputTokens: request.maxOutputTokens,
      preferredProviderId: request.preferredProviderId ?? selectedProviderId,
      preferredModelId: request.preferredModelId ?? selectedModelId,
    };
  }
}
