import { ConstitutionRuntime } from '../constitution-runtime';
import { AIMemoryBridge } from './ai-memory-bridge';
import { AISessionManager } from './ai-session-manager';
import { AvailabilityMonitor } from './availability-monitor';
import { CapabilityRegistry } from './capability-registry';
import { ConstitutionalRoutingEngine } from './constitutional-routing-engine';
import { ContextBuilder } from './context-builder';
import { CostAnalyzer } from './cost-analyzer';
import { FallbackEngine } from './fallback-engine';
import { LatencyMonitor } from './latency-monitor';
import { LoadDistributionEngine } from './load-distribution-engine';
import { ModelRegistry } from './model-registry';
import { MultiProviderOrchestrator } from './multi-provider-orchestrator';
import { PerformanceAnalyzer } from './performance-analyzer';
import { PromptDispatcher } from './prompt-dispatcher';
import { ProviderHealthMonitor } from './provider-health-monitor';
import { ProviderRegistry } from './provider-registry';
import { ProviderSelectionEngine } from './provider-selection-engine';
import { ResponseNormalizer } from './response-normalizer';
import { SovereignAIIntegrationRuntimeState } from './runtime-state';
import { SovereignAIIntegrationRuntime } from './sovereign-ai-integration-runtime';
import { AICapabilityType } from './provider-contracts';

const DEFAULT_CAPABILITIES: readonly AICapabilityType[] = [
  'text-generation',
  'chat-completion',
  'embedding',
  'image-generation',
  'image-editing',
  'audio-transcription',
  'audio-generation',
  'vision-analysis',
  'tool-use',
  'reasoning',
];

export function createSovereignAIIntegrationRuntime(
  constitutionRuntime: ConstitutionRuntime = new ConstitutionRuntime()
): SovereignAIIntegrationRuntime {
  const providerRegistry = new ProviderRegistry();
  const capabilityRegistry = new CapabilityRegistry();
  const modelRegistry = new ModelRegistry();
  const healthMonitor = new ProviderHealthMonitor();
  const availabilityMonitor = new AvailabilityMonitor();
  const latencyMonitor = new LatencyMonitor();
  const performanceAnalyzer = new PerformanceAnalyzer(latencyMonitor);
  const costAnalyzer = new CostAnalyzer();
  const selectionEngine = new ProviderSelectionEngine(
    healthMonitor,
    modelRegistry,
    availabilityMonitor,
    performanceAnalyzer,
    costAnalyzer
  );
  const routingEngine = new ConstitutionalRoutingEngine(constitutionRuntime, modelRegistry);
  const runtimeState = new SovereignAIIntegrationRuntimeState();
  const orchestrator = new MultiProviderOrchestrator(
    providerRegistry,
    selectionEngine,
    routingEngine,
    new FallbackEngine(),
    new LoadDistributionEngine(),
    new AISessionManager(),
    new ContextBuilder(),
    new PromptDispatcher(),
    new ResponseNormalizer(costAnalyzer),
    new AIMemoryBridge(),
    runtimeState
  );

  DEFAULT_CAPABILITIES.forEach((capability) => {
    capabilityRegistry.register({
      capabilityId: `ai-capability-${capability}`,
      type: capability,
      description: `Sovereign AI capability contract for ${capability}.`,
      constitutionalScopes: ['provider-management'],
    });
  });

  return new SovereignAIIntegrationRuntime(
    providerRegistry,
    capabilityRegistry,
    modelRegistry,
    healthMonitor,
    orchestrator,
    runtimeState
  );
}
