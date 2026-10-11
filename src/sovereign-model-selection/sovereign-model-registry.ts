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
  /**
   * ── D-7 · BOTH FLAGS, BECAUSE THE SELECTOR ALWAYS SAID BOTH ───────────────
   *
   *   This filtered on `productionAuthorized` ALONE until 2026-10-11, while
   *   everything around it declared otherwise:
   *
   *     · the selector's own step comment — «production-authorized, ACTIVE
   *       models for this media type»
   *     · the selector's own refusal — «is not production-authorized AND
   *       ACTIVE», a sentence a Creator could be shown about a model that had
   *       only ever been checked against one of the two
   *
   *   So `active` was enforced nowhere in selection. A model RETIRED by
   *   setting `active: false` — which is exactly how `seedance-2-0` and
   *   `nano-banana-pro` were retired by the Founder's final allocation of
   *   2026-09-27 — would still have been selectable the moment it kept
   *   `productionAuthorized: true`. Today no entry is in that shape, so
   *   nothing was mis-selected through this hole; it was a trap, not a wound.
   *
   *   ─── AND THIS CHANGE CANNOT AUTHORISE ANYTHING ─────────────────────────
   *
   *   Adding a conjunct to a filter can only ever REMOVE candidates. No model
   *   becomes selectable by it, no flag is altered, and the three entries
   *   whose two flags disagree stay exactly as the registry declares them —
   *   their intended status is the Chief Architect's to rule.
   */
  findProductionAuthorized(mediaType: MediaType): readonly SovereignMediaModelDescriptor[] {
    return this.findByMediaType(mediaType).filter((m) => m.productionAuthorized && m.active);
  }

  list(): readonly SovereignMediaModelDescriptor[] {
    return Array.from(this.models.values());
  }

  size(): number {
    return this.models.size;
  }
}
