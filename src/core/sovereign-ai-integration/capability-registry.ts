import { AICapabilityDescriptor, AICapabilityType } from './provider-contracts';

export class CapabilityRegistry {
  private readonly capabilities = new Map<AICapabilityType, AICapabilityDescriptor>();

  public register(capability: AICapabilityDescriptor): void {
    this.capabilities.set(capability.type, capability);
  }

  public get(type: AICapabilityType): AICapabilityDescriptor | undefined {
    return this.capabilities.get(type);
  }

  public list(): readonly AICapabilityDescriptor[] {
    return Array.from(this.capabilities.values());
  }

  public supports(type: AICapabilityType): boolean {
    return this.capabilities.has(type);
  }
}
