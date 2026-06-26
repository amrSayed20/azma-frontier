import { ConstitutionRuntime } from '../constitution-runtime';
import { createSovereignAIIntegrationRuntime } from './bootstrap';
import {
  AICapabilityDescriptor,
  AIModelDescriptor,
  AIProviderAdapter,
  SovereignAIRequest,
} from './provider-contracts';
import { SovereignAIIntegrationRuntime } from './sovereign-ai-integration-runtime';

export class SovereignAIIntegrationApi {
  private readonly runtime: SovereignAIIntegrationRuntime;

  constructor(constitutionRuntime: ConstitutionRuntime = new ConstitutionRuntime()) {
    this.runtime = createSovereignAIIntegrationRuntime(constitutionRuntime);
  }

  public registerProvider(provider: AIProviderAdapter): void {
    this.runtime.registerProvider(provider);
  }

  public registerCapability(capability: AICapabilityDescriptor): void {
    this.runtime.registerCapability(capability);
  }

  public registerModel(model: AIModelDescriptor): void {
    this.runtime.registerModel(model);
  }

  public execute(request: SovereignAIRequest) {
    return this.runtime.execute(request);
  }

  public providers() {
    return this.runtime.providers();
  }

  public capabilities() {
    return this.runtime.capabilities();
  }

  public models() {
    return this.runtime.models();
  }

  public health() {
    return this.runtime.health();
  }

  public snapshot() {
    return this.runtime.snapshot();
  }
}
