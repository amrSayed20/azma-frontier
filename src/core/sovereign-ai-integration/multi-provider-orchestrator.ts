import { AIMemoryBridge } from './ai-memory-bridge';
import { AISessionManager } from './ai-session-manager';
import { ConstitutionalRoutingEngine } from './constitutional-routing-engine';
import { ContextBuilder } from './context-builder';
import { FallbackEngine } from './fallback-engine';
import { LoadDistributionEngine } from './load-distribution-engine';
import { PromptDispatcher } from './prompt-dispatcher';
import { ProviderHealthMonitor } from './provider-health-monitor';
import { ProviderRegistry } from './provider-registry';
import { ProviderSelectionEngine } from './provider-selection-engine';
import { ResponseNormalizer } from './response-normalizer';
import { SovereignAIIntegrationRuntimeState } from './runtime-state';
import { NormalizedAIResponse, SovereignAIRequest } from './provider-contracts';

// EMA weight applied to each new dispatch sample (20% new, 80% prior history)
const HEALTH_EMA_ALPHA = 0.2;

export class MultiProviderOrchestrator {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly selectionEngine: ProviderSelectionEngine,
    private readonly routingEngine: ConstitutionalRoutingEngine,
    private readonly fallbackEngine: FallbackEngine,
    private readonly loadDistributionEngine: LoadDistributionEngine,
    private readonly sessionManager: AISessionManager,
    private readonly contextBuilder: ContextBuilder,
    private readonly dispatcher: PromptDispatcher,
    private readonly normalizer: ResponseNormalizer,
    private readonly memoryBridge: AIMemoryBridge,
    private readonly runtimeState: SovereignAIIntegrationRuntimeState,
    private readonly healthMonitor: ProviderHealthMonitor
  ) {}

  public async execute(request: SovereignAIRequest): Promise<NormalizedAIResponse> {
    const session = this.sessionManager.getOrCreate(request.requestedBy, request.context.sessionId);
    this.sessionManager.recordRequest(session.sessionId, request.requestId);

    const selected = this.selectionEngine.select(this.providerRegistry.list(), request);
    const candidates = this.loadDistributionEngine.distribute(selected);
    const routing = this.routingEngine.route(request, candidates);
    this.runtimeState.recordRouting(routing);

    if (!routing.allowed) {
      const blocked = this.normalizer.blocked(request, routing, 'AI request blocked by sovereign constitutional routing.');
      this.runtimeState.recordResponse(blocked);
      this.memoryBridge.store({ request, routing, response: blocked });
      return blocked;
    }

    const context = this.contextBuilder.build(request, this.memoryBridge.recall(request));
    const orderedProviders = this.fallbackEngine.order(routing, candidates);

    for (const provider of orderedProviders) {
      if (provider.descriptor.providerId !== routing.selectedProviderId) {
        this.runtimeState.recordFallbackAttempt();
      }

      try {
        const raw = await this.dispatcher.dispatch(provider, { request, context, routing });
        const prev = this.healthMonitor.get(provider.descriptor.providerId);
        this.healthMonitor.record(provider.descriptor.providerId, {
          status: 'available',
          successRate: HEALTH_EMA_ALPHA + (1 - HEALTH_EMA_ALPHA) * (prev?.successRate ?? 1),
          averageLatencyMs: HEALTH_EMA_ALPHA * raw.latencyMs + (1 - HEALTH_EMA_ALPHA) * (prev?.averageLatencyMs ?? 0),
          availabilityScore: 1,
          lastCheckedAt: new Date(),
        });
        const response = this.normalizer.normalize(request, routing, raw, provider.descriptor);
        this.runtimeState.recordResponse(response);
        this.memoryBridge.store({ request, routing, response });
        return response;
      } catch {
        const prev = this.healthMonitor.get(provider.descriptor.providerId);
        this.healthMonitor.record(provider.descriptor.providerId, {
          status: 'degraded',
          successRate: (1 - HEALTH_EMA_ALPHA) * (prev?.successRate ?? 1),
          availabilityScore: 0.5,
          lastCheckedAt: new Date(),
        });
        this.runtimeState.recordFallbackAttempt();
      }
    }

    const failed = this.normalizer.blocked(request, routing, 'AI request could not be completed by any constitutional provider route.');
    this.runtimeState.recordResponse(failed);
    this.memoryBridge.store({ request, routing, response: failed });
    return failed;
  }
}
