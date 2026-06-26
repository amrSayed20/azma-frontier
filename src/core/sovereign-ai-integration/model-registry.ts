import { AICapabilityType, AIModelDescriptor } from './provider-contracts';

export class ModelRegistry {
  private readonly models = new Map<string, AIModelDescriptor>();

  public register(model: AIModelDescriptor): void {
    this.models.set(model.modelId, model);
  }

  public get(modelId: string): AIModelDescriptor | undefined {
    return this.models.get(modelId);
  }

  public list(): readonly AIModelDescriptor[] {
    return Array.from(this.models.values());
  }

  public findByProvider(providerId: string): readonly AIModelDescriptor[] {
    return this.list().filter((model) => model.providerId === providerId && model.active);
  }

  public findByCapability(providerId: string, capability: AICapabilityType): AIModelDescriptor | undefined {
    return this.findByProvider(providerId).find((model) => model.capabilities.includes(capability));
  }
}
