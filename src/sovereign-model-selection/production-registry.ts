import { SovereignModelRegistry } from './sovereign-model-registry';
import { IMAGE_MODEL_FLEET } from './image-model-fleet';
import { VIDEO_MODEL_FLEET } from './video-model-fleet';
import { SovereignModelSelector } from './sovereign-model-selector';

// Process-scoped singleton — one registry and one selector per process.
let _registry: SovereignModelRegistry | null = null;
let _selector: SovereignModelSelector | null = null;

export function getProductionRegistry(): SovereignModelRegistry {
  if (!_registry) {
    _registry = new SovereignModelRegistry();
    for (const model of IMAGE_MODEL_FLEET) _registry.register(model);
    for (const model of VIDEO_MODEL_FLEET) _registry.register(model);
  }
  return _registry;
}

export function getProductionSelector(): SovereignModelSelector {
  if (!_selector) {
    _selector = new SovereignModelSelector(getProductionRegistry());
  }
  return _selector;
}

// Test-only — resets singletons so test registries take effect.
export function resetProductionRegistryForTests(): void {
  _registry = null;
  _selector = null;
}
