import type { MediaType, SovereignMediaModelDescriptor } from './types';

/**
 * Sovereign Media Model Registry.
 *
 * Holds all registered image and video model descriptors.
 * Separate from the orchestrator's AIModelDescriptor registry — this registry
 * carries media-specific capability data (quality tier, resolution, duration,
 * authorization status) that the orchestrator does not need.
 *
 * The SovereignModelSelector queries this registry exclusively.
 * The orchestrator's ProviderSelectionPlanner is invoked AFTER selection,
 * using preferredProviderId + preferredModelId already resolved here.
 */
export class SovereignModelRegistry {
  private readonly models = new Map<string, SovereignMediaModelDescriptor>();

  register(model: SovereignMediaModelDescriptor): void {
    this.models.set(model.modelId, model);
  }

  getById(modelId: string): SovereignMediaModelDescriptor | undefined {
    return this.models.get(modelId);
  }

  findByMediaType(mediaType: MediaType): readonly SovereignMediaModelDescriptor[] {
    return Array.from(this.models.values()).filter(
      (m) => m.mediaType === mediaType && m.active,
    );
  }

  findByCapability(capability: string): readonly SovereignMediaModelDescriptor[] {
    return Array.from(this.models.values()).filter(
      (m) => m.active && m.capabilities.includes(capability),
    );
  }

  // Returns only models that are active AND production-authorized for the given media type.
  // These are the only models eligible for paid or trial generation.
  findProductionAuthorized(mediaType: MediaType): readonly SovereignMediaModelDescriptor[] {
    return this.findByMediaType(mediaType).filter((m) => m.productionAuthorized);
  }

  list(): readonly SovereignMediaModelDescriptor[] {
    return Array.from(this.models.values());
  }

  size(): number {
    return this.models.size;
  }
}
