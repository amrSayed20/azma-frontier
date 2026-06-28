import { createConstitutionRuntimeEngine } from './constitution-bootstrap';
import { ConstitutionActionContext, ConstitutionArticleDefinition, ConstitutionEvaluationResult, ConstitutionEventRecord, ConstitutionLoadResult, ConstitutionStateSnapshot } from './constitution-types';
import { ConstitutionEngine } from './constitution-engine';
import { createConstitutionalAuthorityMap, ConstitutionalAuthorityMap } from './constitutional-authority-map';
import { AuthorityQueryRequest, AuthorityQueryResult, AuthorityRuleTrace, AuthorityValidationRequest, AuthorityValidationResult, ConstitutionalAuthorityMapSnapshot } from './constitutional-authority-map-types';
import { createEscalationHierarchyContract, EscalationHierarchyContract } from './escalation-hierarchy-contract';
import { EscalationHierarchySnapshot, EscalationRequest, EscalationResolutionRequest, EscalationResolutionResult, EscalationRoute, EscalationTrace } from './escalation-hierarchy-contract-types';
import { createPolicyRuleBoundaryContract, PolicyRuleBoundaryContract } from './policy-rule-boundary-contract';
import { PolicyBoundaryEvaluation, PolicyBoundaryRequest, PolicyBoundarySnapshot, PolicyBoundaryTrace } from './policy-rule-boundary-contract-types';
import { createPolicyDecisionTraceSchema, PolicyDecisionTraceSchema } from './policy-decision-trace';
import { PolicyDecisionTraceRequest, PolicyDecisionTraceResponse, PolicyDecisionTraceQueryRequest, PolicyDecisionTraceQueryResult, PolicyDecisionTraceAuditReport, PolicyDecisionTraceSnapshot, PolicyDecisionTraceStatistics, PolicyDecisionTrace } from './policy-decision-trace-types';
import { createImmutableDecisionAuditBackbone, ImmutableDecisionAuditBackbone, AuditEventMetadata, AuditQueryCriteria, AuditBackboneSnapshot, AuditBackboneStatistics } from './wp-005-immutable-audit-backbone';

export class ConstitutionRuntime {
  private readonly engine: ConstitutionEngine;
  private readonly authorityMap: ConstitutionalAuthorityMap;
  private readonly escalationContract: EscalationHierarchyContract;
  private readonly policyBoundaryContract: PolicyRuleBoundaryContract;
  private readonly policyDecisionTraceSchema: PolicyDecisionTraceSchema;
  private readonly immutableAuditBackbone: ImmutableDecisionAuditBackbone;

  constructor(
    engine: ConstitutionEngine = createConstitutionRuntimeEngine(),
    authorityMap: ConstitutionalAuthorityMap = createConstitutionalAuthorityMap()
  ) {
    this.engine = engine;
    this.authorityMap = authorityMap;
    this.escalationContract = createEscalationHierarchyContract(this.authorityMap);
    this.policyBoundaryContract = createPolicyRuleBoundaryContract(
      this.authorityMap,
      this.escalationContract,
      () => this.engine.getRegistry().getPolicies()
    );
    this.policyDecisionTraceSchema = createPolicyDecisionTraceSchema();
    this.immutableAuditBackbone = createImmutableDecisionAuditBackbone();
  }

  public loadConstitution(): ConstitutionLoadResult {
    return this.engine.loadConstitution();
  }

  public evaluate(action: ConstitutionActionContext): ConstitutionEvaluationResult {
    return this.engine.evaluate(action);
  }

  public resolvePermissions(action: ConstitutionActionContext) {
    return this.engine.resolvePermissions(action);
  }

  public resolvePriority(action: ConstitutionActionContext) {
    return this.engine.resolvePriority(action);
  }

  public publishState(): ConstitutionStateSnapshot {
    return this.engine.publishState();
  }

  public recordHistory(action: ConstitutionActionContext, decision: ConstitutionEvaluationResult['decision'], status: ConstitutionEvaluationResult['status'], reasons: readonly string[]): void {
    this.engine.recordHistory(action, decision, status, reasons);
  }

  public getEvents(): readonly ConstitutionEventRecord[] {
    return this.engine.getEvents();
  }

  public getState(): ConstitutionStateSnapshot | undefined {
    return this.engine.getState();
  }

  public getArticle(articleId: ConstitutionArticleDefinition['articleId']): ConstitutionArticleDefinition {
    return this.engine.getArticle(articleId);
  }

  /**
   * Public interface: Authority Query Interface.
   */
  public queryAuthority(request: AuthorityQueryRequest): AuthorityQueryResult {
    return this.authorityMap.queryAuthority(request);
  }

  /**
   * Public interface: Authority Validation Interface.
   */
  public validateAuthority(request: AuthorityValidationRequest): AuthorityValidationResult {
    return this.authorityMap.validateAuthority(request);
  }

  /**
   * Public interface: Authority Trace Interface.
   */
  public traceAuthorityRule(ruleId: string): AuthorityRuleTrace {
    return this.authorityMap.traceAuthorityRule(ruleId);
  }

  public getAuthorityMapSnapshot(): ConstitutionalAuthorityMapSnapshot {
    return this.authorityMap.getSnapshot();
  }

  /**
   * Public interface: Approval and Escalation Interface.
   */
  public planEscalation(request: EscalationRequest): EscalationRoute {
    return this.escalationContract.planEscalation(request);
  }

  public resolveEscalation(request: EscalationResolutionRequest): EscalationResolutionResult {
    return this.escalationContract.resolveEscalation(request);
  }

  public traceEscalation(escalationId: string): EscalationTrace {
    return this.escalationContract.traceEscalation(escalationId);
  }

  public getEscalationSnapshot(): EscalationHierarchySnapshot {
    return this.escalationContract.getSnapshot();
  }

  /**
   * Public interface: Policy Rule Boundary Contract Interface.
   */
  public evaluatePolicyBoundary(request: PolicyBoundaryRequest): PolicyBoundaryEvaluation {
    return this.policyBoundaryContract.evaluateBoundary(request);
  }

  public tracePolicyBoundary(boundaryId: string): PolicyBoundaryTrace {
    return this.policyBoundaryContract.traceBoundary(boundaryId);
  }

  public getPolicyBoundarySnapshot(): PolicyBoundarySnapshot {
    return this.policyBoundaryContract.getSnapshot();
  }

  /**
   * Public interface: Policy Decision Trace Schema Interface (WP-004).
   * Records immutable traces of all policy decisions for constitutional audit.
   */
  public recordPolicyDecisionTrace(request: PolicyDecisionTraceRequest): PolicyDecisionTraceResponse {
    return this.policyDecisionTraceSchema.recordTrace(request);
  }

  public queryPolicyDecisionTraces(request: PolicyDecisionTraceQueryRequest): PolicyDecisionTraceQueryResult {
    return this.policyDecisionTraceSchema.queryTraces(request);
  }

  public auditPolicyDecisionTraces(): PolicyDecisionTraceAuditReport {
    return this.policyDecisionTraceSchema.generateAuditReport();
  }

  public getPolicyDecisionTraceSnapshot(): PolicyDecisionTraceSnapshot {
    return this.policyDecisionTraceSchema.getSnapshot();
  }

  public getPolicyDecisionTraceStatistics(): PolicyDecisionTraceStatistics {
    return this.policyDecisionTraceSchema.getStatistics();
  }

  public verifyPolicyDecisionTraceChain(): boolean {
    return this.policyDecisionTraceSchema.verifyChainIntegrity();
  }

  /**
   * Public interface: Immutable Decision Audit Backbone Interface (WP-005).
   * Provides persistent, queryable audit trail for all policy decisions with recovery support.
   * Exposes Phase 2 abstractions for future work packages (WP-006+).
   */

  /**
   * Persist a recorded decision trace to the immutable audit backbone.
   * Phase 2: Abstracts AuditEventMetadata for WP-011 telemetry, WP-013+ lifecycle events.
   */
  public async persistDecisionTraceToAudit(
    traceId: string,
    metadata: Partial<AuditEventMetadata>,
  ): Promise<{ success: boolean; auditId: string; error?: string }> {
    try {
      const trace = this.policyDecisionTraceSchema.getTrace(traceId);
      if (!trace) {
        return { success: false, auditId: '', error: 'Trace not found' };
      }
      return this.immutableAuditBackbone.recordDecisionTrace(trace, metadata);
    } catch (error) {
      return { success: false, auditId: '', error: (error as Error).message };
    }
  }

  /**
   * Query the immutable audit backbone using Phase 2 QueryableAuditStore interface.
   * Supports: actor, source, correlation, tags, time ranges.
   * Used by WP-011 (telemetry queries), WP-012 (alert queries), WP-044 (validation).
   */
  public async queryAuditBackbone(criteria: AuditQueryCriteria): Promise<PolicyDecisionTrace[]> {
    return this.immutableAuditBackbone.query(criteria);
  }

  /**
   * Verify integrity of the audit backbone chain.
   * Used by WP-044 (constitutional traceability validation), WP-048 (recovery rehearsal).
   */
  public async verifyAuditIntegrity(): Promise<{ valid: boolean; chainIntegrityScore: number }> {
    return this.immutableAuditBackbone.verifyAuditIntegrity();
  }

  /**
   * Get statistics on the audit backbone.
   * Exposes indices for WP-011 telemetry categorization, WP-013+ event correlation.
   */
  public async getAuditBackboneStatistics(): Promise<AuditBackboneStatistics> {
    return this.immutableAuditBackbone.getStatistics();
  }

  /**
   * Get snapshot of audit backbone state.
   * Used by WP-044 (validation suite), WP-047 (rehearsal).
   */
  public async getAuditBackboneSnapshot(): Promise<AuditBackboneSnapshot> {
    return this.immutableAuditBackbone.getSnapshot();
  }

  /**
   * Phase 2 RecoveryInterface: Validate recovery path for WP-046 rollback support.
   */
  public async validateAuditRecoveryPath(fromTime: number, toTime: number): Promise<boolean> {
    return this.immutableAuditBackbone.validateRecoveryPath(fromTime, toTime);
  }

  /**
   * Phase 2 RecoveryInterface: Get snapshot at specific timestamp for WP-046, WP-048.
   */
  public async getAuditSnapshotAt(timestamp: number): Promise<PolicyDecisionTrace | null> {
    return this.immutableAuditBackbone.getSnapshotAt(timestamp);
  }
}
