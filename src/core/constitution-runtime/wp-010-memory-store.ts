/**
 * WP-010: ConstitutionalMemoryService (Layer 4)
 * Persistent (session-scoped) record of constitutional decisions
 *
 * LAYER CLASSIFICATION: Layer 4 (Memory)
 * KERNEL DEPENDENCIES: Layers 1-3 (ConstitutionArticleId, AuditTrailId)
 *
 * Responsibility:
 * - Record every runtime decision with its constitutional authority
 * - Enable downstream layers to recall what was decided for a request
 * - Allow queries by ConstitutionArticleId for pattern analysis
 *
 * ASP: Dual-index Map (by requestId + by articleId) gives O(1) recall
 *       without extra abstraction layers. One class, zero external deps.
 *
 * Determinism: recall(requestId) always returns the latest remembered entry
 *               for that request. Multiple calls produce identical results
 *               for an unchanged store.
 */

import type { ConstitutionArticleId } from './constitution-types';
import type { AuditTrailId } from './wp-008-types';
import type {
  MemoryEntry,
  ConstitutionalMemoryServiceContract,
} from './wp-009-types';

export class ConstitutionalMemoryService implements ConstitutionalMemoryServiceContract {
  readonly serviceName = 'ConstitutionalMemoryService' as const;
  readonly version = '1.0.0' as const;

  // Primary index: requestId → latest MemoryEntry
  private readonly byRequest = new Map<string, MemoryEntry>();
  // Secondary index: articleId → all MemoryEntries for that article
  private readonly byArticle = new Map<ConstitutionArticleId, MemoryEntry[]>();

  private entryCounter = 0;

  async remember(
    requestId: string,
    articleId: ConstitutionArticleId,
    summary: string,
    auditId: AuditTrailId,
  ): Promise<MemoryEntry> {
    const entry: MemoryEntry = {
      entryId: `mem-${++this.entryCounter}-${requestId}`,
      requestId,
      constitutionArticleId: articleId,
      decisionSummary: summary,
      auditTrailId: auditId,
      recordedAt: new Date(),
    };

    // Upsert primary index (latest wins for a requestId)
    this.byRequest.set(requestId, entry);

    // Append to secondary index
    const existing = this.byArticle.get(articleId);
    if (existing) {
      existing.push(entry);
    } else {
      this.byArticle.set(articleId, [entry]);
    }

    return entry;
  }

  async recall(requestId: string): Promise<MemoryEntry | null> {
    return this.byRequest.get(requestId) ?? null;
  }

  async recallByArticle(
    articleId: ConstitutionArticleId,
  ): Promise<readonly MemoryEntry[]> {
    return this.byArticle.get(articleId) ?? [];
  }

  async getMemorySize(): Promise<number> {
    return this.byRequest.size;
  }
}
