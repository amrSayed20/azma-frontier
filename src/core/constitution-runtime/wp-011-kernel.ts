/**
 * WP-011: Memory Layer Kernel (Layer 4)
 * Orchestrates StateCacheService and ConstitutionalMemoryService
 *
 * LAYER CLASSIFICATION: Layer 4 (Memory)
 * KERNEL DEPENDENCIES: Layers 1-3 (consumed; not re-exported here)
 *
 * This is the canonical entry point for Layer 5+ consumers.
 * All Layer 4 types and services are re-exported from this module.
 *
 * ASP: Factory function instead of class — no instantiation overhead,
 *       no inheritance, straightforward removal if replaced.
 */

import type { MemoryLayerContract } from './wp-009-types';
import { StateCacheService } from './wp-009-state-cache';
import { ConstitutionalMemoryService } from './wp-010-memory-store';

/**
 * Create and initialize the Memory Layer (Layer 4)
 * Returns the immutable public contract for Layer 5+ consumers
 */
export function createMemoryLayer(): MemoryLayerContract {
  return {
    layerName: 'MemoryLayer',
    version: '1.0.0',
    layerNumber: 4,
    stateCacheService: new StateCacheService(),
    constitutionalMemoryService: new ConstitutionalMemoryService(),
  } as const;
}

// Re-export all Layer 4 types for consumers
export * from './wp-009-types';

// Re-export service implementations (for direct testing)
export { StateCacheService } from './wp-009-state-cache';
export { ConstitutionalMemoryService } from './wp-010-memory-store';
