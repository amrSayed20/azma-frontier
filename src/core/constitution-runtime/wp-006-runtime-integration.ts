/**
 * WP-006: Constitutional Rationale Linkage — Constitution Runtime Integration
 * 
 * Purpose: Integrate WP-006 rationale linkage with existing WP-001→WP-004→WP-005 stack
 * 
 * Integration Points:
 * - WP-001: Constitutional Authority Map (article registry)
 * - WP-004: Policy Decision Trace (decision source)
 * - WP-005: Immutable Audit Backbone (rationale storage)
 */

import { ConstitutionalRationaleLinkage, createConstitutionalRationaleLinkage } from './wp-006-constitutional-rationale-linkage';
import { PolicyDecisionTrace } from './policy-decision-trace-types';
import { ConstitutionArticleId } from './constitution-types';
import {
  DecisionRationaleRecord,
  ArticleDecisionStatistics,
  RationaleLinkageBatch
} from './wp-006-rationale-linkage-types';

/**
 * Runtime integration layer connecting WP-006 to constitution runtime.
 * 
 * Responsibilities:
 * - Provide WP-006 interface to constitution runtime
 * - Accept policy decision traces (WP-004)
 * - Link decisions to constitutional articles (WP-001)
 * - Persist rationales to audit backbone (WP-005)
 * - Query rationale linkages for agents and systems
 */
export class ConstitutionRuntimeWP006Integration {
  private rationaleLinkage: ConstitutionalRationaleLinkage;

  constructor(
    constitutionArticleRegistry: Map<ConstitutionArticleId, { number: number; title: string }>,
    private auditBackbone?: any,
    private policyTraceStore?: any
  ) {
    this.rationaleLinkage = createConstitutionalRationaleLinkage(
      constitutionArticleRegistry,
      auditBackbone
    );
  }

  // =========================================================================
  // PUBLIC API: RATIONALE LINKAGE
  // =========================================================================

  /**
   * Link a policy decision (from WP-004) to its constitutional basis (from WP-001).
   * 
   * Called by: Decision systems, orchestrators, human approval flows
   * 
   * Example:
   *   await runtime.linkDecisionToArticle(
   *     decisionTrace,
   *     articleId,
   *     'Decision approved per Article 7 sovereignty requirements'
   *   );
   */
  async linkDecisionToArticle(
    decisionTrace: PolicyDecisionTrace,
    articleId: ConstitutionArticleId,
    rationale: string,
    linkedBy: string = 'system',
    linkedByRole: 'system' | 'human' | 'agent' | 'orchestrator' = 'system'
  ): Promise<DecisionRationaleRecord> {
    // Validate decision trace exists (optional — WP-006 doesn't require WP-004 validation)
    if (this.policyTraceStore && !this.policyTraceStore.hasTrace(decisionTrace.traceId)) {
      console.warn(`Decision trace ${decisionTrace.traceId} not found in WP-004 store`);
    }

    return this.rationaleLinkage.linkDecisionToArticle(
      decisionTrace.traceId,
      articleId,
      rationale,
      linkedBy,
      linkedByRole
    );
  }

  /**
   * Query rationale linkages by article (fast O(1) article-scoped query).
   * 
   * Called by: Sovereign agents, decision systems, intelligence layer
   */
  async queryRationalesByArticle(
    articleId: ConstitutionArticleId,
    options?: {
      limit?: number;
      actor?: string;
      orderBy?: 'timestamp' | 'article' | 'actor';
    }
  ): Promise<readonly DecisionRationaleRecord[]> {
    return this.rationaleLinkage.queryRationales({
      articleId,
      limit: options?.limit,
      actor: options?.actor,
      orderBy: options?.orderBy
    });
  }

  /**
   * Query rationale linkages by decision ID.
   * 
   * Called by: Audit systems, integrity validation
   */
  async queryRationalesByDecision(decisionId: string): Promise<readonly DecisionRationaleRecord[]> {
    return this.rationaleLinkage.queryRationales({
      decisionId
    });
  }

  /**
   * Get statistics on decision corpus within an article scope.
   * 
   * Called by: Reporting systems, agent learning systems
   */
  async getArticleStatistics(articleId: ConstitutionArticleId): Promise<ArticleDecisionStatistics> {
    return this.rationaleLinkage.getArticleStatistics(articleId);
  }

  /**
   * Link multiple decisions in a batch (idempotent operation).
   * 
   * Called by: Memory system initialization, bulk import
   */
  async linkBatch(
    batch: RationaleLinkageBatch,
    actor: string = 'batch-system'
  ): Promise<readonly DecisionRationaleRecord[]> {
    return this.rationaleLinkage.linkBatch(batch, actor);
  }

  // =========================================================================
  // PUBLIC API: VALIDATION & INTEGRITY
  // =========================================================================

  /**
   * Verify integrity of all rationale linkages (detects tampering).
   * 
   * Called by: Constitutional audit systems, compliance validators
   */
  async verifyRationaleIntegrity(): Promise<{
    valid: boolean;
    tamperedRecords: string[];
  }> {
    return this.rationaleLinkage.verifyIntegrity();
  }

  /**
   * Validate a rationale string for coherence and length constraints.
   * 
   * Called by: Input validators, approval workflows
   */
  validateRationaleText(rationale: string): {
    valid: boolean;
    errors: readonly string[];
    warnings: readonly string[];
  } {
    try {
      return this.rationaleLinkage.validateRationale(rationale);
    } catch (err) {
      return {
        valid: false,
        errors: [err instanceof Error ? err.message : 'Unknown validation error'],
        warnings: []
      };
    }
  }

  // =========================================================================
  // INTERNAL: INTEGRATION WITH WP-005 AUDIT BACKBONE
  // =========================================================================

  /**
   * Retrieve audit backbone reference for WP-005 persistence layer.
   */
  getAuditBackboneReference(): any {
    return this.auditBackbone;
  }

  /**
   * Retrieve policy trace store reference for WP-004 validation.
   */
  getPolicyTraceStoreReference(): any {
    return this.policyTraceStore;
  }

  // =========================================================================
  // STATISTICS & REPORTING
  // =========================================================================

  /**
   * Get statistics summary across all articles.
   * 
   * Called by: Executive reporting, system health checks
   */
  async getGlobalStatistics(): Promise<{
    totalLinkages: number;
    articlesWithLinkages: number;
    uniqueActors: number;
    averageRatianaleLengthChars: number;
    validationStatusBreakdown: {
      valid: number;
      requiresReview: number;
      potentiallyStalse: number;
    };
  }> {
    // Placeholder: would be implemented with actual statistics aggregation
    return {
      totalLinkages: 0,
      articlesWithLinkages: 0,
      uniqueActors: 0,
      averageRatianaleLengthChars: 0,
      validationStatusBreakdown: {
        valid: 0,
        requiresReview: 0,
        potentiallyStalse: 0
      }
    };
  }
}

/**
 * Factory for creating WP-006 integration with constitution runtime.
 */
export function createWP006Integration(
  constitutionArticleRegistry: Map<ConstitutionArticleId, { number: number; title: string }>,
  auditBackbone?: any,
  policyTraceStore?: any
): ConstitutionRuntimeWP006Integration {
  return new ConstitutionRuntimeWP006Integration(
    constitutionArticleRegistry,
    auditBackbone,
    policyTraceStore
  );
}
