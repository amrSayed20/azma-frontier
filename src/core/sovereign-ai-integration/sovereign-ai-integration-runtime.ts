import {
  AICapabilityDescriptor,
  AIModelDescriptor,
  AIProviderAdapter,
  NormalizedAIResponse,
  SovereignAIRequest,
} from './provider-contracts';
import { CapabilityRegistry } from './capability-registry';
import { ModelRegistry } from './model-registry';
import { MultiProviderOrchestrator } from './multi-provider-orchestrator';
import { ProviderHealthMonitor } from './provider-health-monitor';
import { ProviderRegistry } from './provider-registry';
import { SovereignAIIntegrationRuntimeState } from './runtime-state';

export class SovereignAIIntegrationRuntime {
  constructor(
    private readonly providerRegistry: ProviderRegistry,
    private readonly capabilityRegistry: CapabilityRegistry,
    private readonly modelRegistry: ModelRegistry,
    private readonly healthMonitor: ProviderHealthMonitor,
    private readonly orchestrator: MultiProviderOrchestrator,
    private readonly runtimeState: SovereignAIIntegrationRuntimeState
  ) {}

  public registerProvider(provider: AIProviderAdapter): void {
    this.providerRegistry.register(provider);
    this.healthMonitor.observe(provider);
    provider.descriptor.modelIds.forEach((modelId) => {
      if (!this.modelRegistry.get(modelId)) {
        this.modelRegistry.register({
          modelId,
          providerId: provider.descriptor.providerId,
          displayName: modelId,
          capabilities: provider.descriptor.capabilities,
          contextWindow: 0,
          maxOutputTokens: 0,
          active: true,
        });
      }
    });
  }

  public registerCapability(capability: AICapabilityDescriptor): void {
    this.capabilityRegistry.register(capability);
  }

  public registerModel(model: AIModelDescriptor): void {
    this.modelRegistry.register(model);
  }

  public execute(request: SovereignAIRequest): Promise<NormalizedAIResponse> {
    return this.orchestrator.execute(request);
  }

  public providers() {
    return this.providerRegistry.descriptors();
  }

  public capabilities() {
    return this.capabilityRegistry.list();
  }

  public models() {
    return this.modelRegistry.list();
  }

  public health() {
    return this.healthMonitor.list();
  }

  public snapshot() {
    return this.runtimeState.snapshot();
  }
}
