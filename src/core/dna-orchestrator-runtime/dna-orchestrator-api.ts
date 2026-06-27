import { AIProviderAdapter, SovereignAIIntegrationApi } from '../sovereign-ai-integration';
import { createDNAOrchestratorRuntime } from './bootstrap';
import { DNAOrchestrationRequest } from './dna-orchestrator-types';
import { DNAOrchestratorRuntime } from './dna-orchestrator-runtime';

export class DNAOrchestratorApi {
  private readonly runtime: DNAOrchestratorRuntime;

  constructor(aiIntegrationApi?: SovereignAIIntegrationApi) {
    this.runtime = createDNAOrchestratorRuntime(aiIntegrationApi);
  }

  public registerProvider(provider: AIProviderAdapter): void {
    this.runtime.registerProvider(provider);
  }

  public orchestrate(request: DNAOrchestrationRequest) {
    return this.runtime.orchestrate(request);
  }

  public inventory() {
    return this.runtime.inventory();
  }

  public recentHistory(limit?: number) {
    return this.runtime.recentHistory(limit);
  }

  public recentTelemetry(limit?: number) {
    return this.runtime.recentTelemetry(limit);
  }

  public snapshot() {
    return this.runtime.snapshot();
  }
}
