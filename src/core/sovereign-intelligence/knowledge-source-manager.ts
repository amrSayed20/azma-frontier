/**
 * Sovereign Intelligence Layer — Knowledge Source Manager (Component 1)
 *
 * Unified registry for all external and internal knowledge sources.
 * Provides availability checking without exposing provider-specific
 * implementation details to the intelligence pipeline.
 */

import type { IKnowledgeSource } from './sovereign-intelligence-types';

export class KnowledgeSourceManager {
  readonly serviceName = 'KnowledgeSourceManager' as const;

  private readonly sources = new Map<string, IKnowledgeSource>();

  register(source: IKnowledgeSource): void {
    this.sources.set(source.sourceId, source);
  }

  getSource(sourceId: string): IKnowledgeSource | undefined {
    return this.sources.get(sourceId);
  }

  getAvailableSources(): readonly IKnowledgeSource[] {
    return Array.from(this.sources.values()).filter((s) => s.isAvailable());
  }

  getAllSources(): readonly IKnowledgeSource[] {
    return Array.from(this.sources.values());
  }

  hasAvailableSources(): boolean {
    return this.getAvailableSources().length > 0;
  }
}
