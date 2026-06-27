import { ConstitutionRuntime } from '../constitution-runtime';
import { SovereignAIIntegrationApi } from '../sovereign-ai-integration';
import { DNAOrchestratorRuntime } from './dna-orchestrator-runtime';
import { OrchestrationHistory } from './orchestration-history';
import { OrchestrationTelemetry } from './orchestration-telemetry';
import { ProviderHealthScoringEngine } from './provider-health-scoring-engine';
import { ProviderPriorityEngine } from './provider-priority-engine';
import { ProviderSelectionPlanner } from './provider-selection-planner';
import { RequestAnalyzer } from './request-analyzer';
import { DNAOrchestratorRuntimeState } from './runtime-state';
import { TaskClassifier } from './task-classifier';

export function createDNAOrchestratorRuntime(
  aiIntegrationApi: SovereignAIIntegrationApi = createDefaultAIIntegrationApi()
): DNAOrchestratorRuntime {
  return new DNAOrchestratorRuntime(
    aiIntegrationApi,
    new RequestAnalyzer(new TaskClassifier()),
    new ProviderSelectionPlanner(new ProviderHealthScoringEngine(), new ProviderPriorityEngine()),
    new OrchestrationHistory(),
    new OrchestrationTelemetry(),
    new DNAOrchestratorRuntimeState()
  );
}

function createDefaultAIIntegrationApi(): SovereignAIIntegrationApi {
  const constitutionRuntime = new ConstitutionRuntime();
  constitutionRuntime.loadConstitution();

  return new SovereignAIIntegrationApi(constitutionRuntime);
}
