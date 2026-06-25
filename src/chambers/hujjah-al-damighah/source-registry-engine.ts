/**
 * AZMA OS
 * Al-Hujjah Al-Damighah
 * Source Registry Engine
 *
 * Status: V1.0
 * Sovereign Source Layer
 */

export type SourceType =
  | 'sacred'
  | 'empirical'
  | 'historical'
  | 'literary'
  | 'general';

export interface SourceRecord {
  id: string;

  name: string;

  type: SourceType;

  author?: string;

  year?: number;

  trustScore: number;

  createdAt: string;
}

export interface SourceRegistry {
  sources: SourceRecord[];
}

export function createSourceRegistry(): SourceRegistry {
  return {
    sources: [],
  };
}

export function registerSource(
  registry: SourceRegistry,
  source: SourceRecord
): SourceRegistry {
  return {
    ...registry,
    sources: [...registry.sources, source],
  };
}

export function findSource(
  registry: SourceRegistry,
  id: string
): SourceRecord | undefined {
  return registry.sources.find(
    (source) => source.id === id
  );
}

export function removeSource(
  registry: SourceRegistry,
  id: string
): SourceRegistry {
  return {
    ...registry,
    sources: registry.sources.filter(
      (source) => source.id !== id
    ),
  };
}